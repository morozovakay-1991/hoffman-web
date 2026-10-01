# Решения по архитектуре

- **Авторизация: BFF-прокси (Этапы 26, 28).** Выбран вариант BFF-прокси через Next.js. Все обращения с сайта к `/api/v1/*` идут не напрямую в Laravel, а через Next.js Route Handler / Server Action. Route Handler выполняется на сервере, читает httpOnly cookie с токеном и сам подставляет заголовок `Authorization: Bearer <token>` в запрос к Laravel — клиентский код (браузер) никогда не видит и не читает токен напрямую, cookie недоступна из JS.

  Клиентский поллинг статуса подписки (нужен на этапе чекаута) обращается к собственному Next.js route (тому же BFF-прокси), а не к Laravel напрямую — токен и здесь остаётся только на сервере Next.js.

  Механизм передачи токена единый для Этапа 26 (базовая связка Next.js ↔ Laravel API) и Этапа 28 (чекаут и поллинг статуса подписки): в обоих случаях действует BFF-прокси через httpOnly cookie + серверную подстановку Bearer-токена, чтобы не возникло расхождения (например, попытки читать токен на клиенте или ходить в Laravel напрямую из браузера).

## Изменения для будущих этапов

- **Этап 26 (Auth).** Токен от Laravel не отдаётся клиенту напрямую. Next.js Route Handler на `login` сам получает токен от Laravel и кладёт его в httpOnly cookie через `Set-Cookie`. Клиент токен не видит и не хранит сам — вся дальнейшая работа с `/api/v1/*` идёт через Route Handler/Server Action, который читает cookie на сервере и подставляет `Authorization: Bearer <token>` в запрос к Laravel.

- **Этап 28 (Чекаут).** Клиентский поллинг статуса подписки идёт на собственный Next.js route (например, `GET /api/subscription`), а не на Laravel напрямую. Этот route выполняется на сервере, читает httpOnly cookie, подставляет Bearer-токен и проксирует запрос в Laravel — браузер обращается только к Next.js и токена не видит.

## Этап 26 (Auth): реализация

- **BFF-прокси.** Браузер обращается только к Route Handlers `app/api/auth/*`, они проксируют запрос в Laravel `/api/v1/auth/*` (`HOFFMAN_API_URL`) и возвращают ответ Laravel как есть (статус, `{error: {code, message, fields}}`, `Retry-After`). `login` / `register` вынимают `token` из ответа, кладут его в httpOnly cookie `hoffman_session` (`SameSite=Lax`, `Secure` в production, 30 дней — токены Sanctum на backend бессрочные) и отдают клиенту только `user`. Route Handlers принимают только `application/json` — это закрывает login CSRF через HTML-форму с чужого сайта. Server Components получают пользователя через `requireUser()` (`GET /auth/me` с Bearer-токеном из cookie); `proxy.ts` делает только оптимистичную проверку наличия cookie.
- **Сброс пароля.** `POST /auth/password/forgot` отвечает 200 и для незарегистрированного email (защита от перебора), поэтому ошибка «Email не зарегистрирован» (ТЗ 11.2) показывается после ввода кода — когда её возвращает `verify-code` (`404 EMAIL_NOT_FOUND`), пользователь возвращается на шаг email. Так же сделано в мобильном приложении.
- **Регистрация.** Backend требует `name`, поэтому в форме есть поле «Имя» (как в мобильном приложении), а также «Повторите пароль».

### Вход через Apple / Google на сайте

**Что есть на backend сейчас.** Только `POST /auth/apple` и `POST /auth/google` с телом `{token}` — проверка токена, полученного мобильным SDK (`userByIdentityToken` / `userFromToken`). Redirect-флоу (`/redirect` + `/callback`, обмен authorization code) на backend нет, в `config/services.php` прямо указано, что code не обменивается.

**Как сделано на сайте.** Redirect-флоу проходит сервер Next.js (он и так BFF): `GET /api/auth/{provider}/start` → провайдер → `/api/auth/{provider}/callback` (Google — GET с `code`, обмениваем на `id_token` с PKCE; Apple — `form_post` с `id_token`) → проверка `state` и `nonce` → тот же `POST /api/v1/auth/{provider} {token}`, что у мобильного приложения → токен Laravel в httpOnly cookie. Отдельные redirect-эндпоинты на backend не нужны, но без доработок ниже вход через Apple на сайте работать не будет, а через Google — только при совпадении client ID.

**Что нужно доделать на backend (hoffman-backend):**

1. **Apple — принимать `aud` веб-клиента.** Сейчас `id_token` проверяется `PermittedFor(services.apple.client_id)`, а `client_id` — bundle id приложения. У веб-токена `aud` = Services ID, поэтому backend вернёт `401 INVALID_PROVIDER_TOKEN` на любой вход с сайта. Нужен список допустимых аудиторий (например, `APPLE_CLIENT_IDS=<bundle id>,<services id>`) и проверка `aud` по нему (своя проверка JWT по JWKS Apple или наследник `SocialiteProviders\Apple\Provider`).
2. **Google — то же для `aud`.** Для JWT Socialite сверяет `aud` строго с `services.google.client_id`. Если это и есть Web client, которым пользуется сайт (`GOOGLE_WEB_CLIENT_ID`), доработка не нужна; иначе — список допустимых client ID, как для Apple. Отдельно: для не-JWT токена Socialite ходит в `userinfo` и принимает access token, выданный **любому** Google-приложению, — стоит принимать только `id_token`.
3. **Rate limit за BFF.** Лимиты `login` / `register` считаются по `$request->ip()`, а `TrustProxies` не настроен — все запросы с сайта приходят с IP сервера Next.js. BFF передаёт `X-Forwarded-For`; на backend нужно `$middleware->trustProxies(at: [<IP сервера Next.js>])`.
4. **Имя из Apple (по желанию).** Apple присылает имя только при первом входе и только в поле `user` формы callback, не в `id_token`, — backend сейчас подставляет часть email. Если имя нужно, `POST /auth/apple` должен принимать необязательный `name`; сайт сможет его передать.
5. **Сброс пароля (безопасность).** `POST /auth/password/reset` не принимает код: после того как владелец подтвердил код, в течение 5 минут пароль может сменить любой, кто знает email. Сайт и мобильное приложение уже отправляют `code` — backend стоит его проверять.

До выполнения п. 1–2 кнопки Apple / Google видны, а при отказе backend пользователь получает явное сообщение «Не удалось войти через …». Без переменных окружения провайдера — «Вход через … временно недоступен» (`PROVIDER_UNAVAILABLE`), а не молчаливая заглушка.

## Личный кабинет (features/profile)

- **BFF.** Браузер ходит в `app/api/profile/*` и `app/api/verification/submit`; `forwardSessionRequest` подставляет Bearer-токен из httpOnly cookie, принимает только `application/json` и возвращает ответ Laravel как есть. `401` от Laravel удаляет cookie; успешный `DELETE /profile` — тоже (backend отзывает все токены). Server Components читают `GET /profile` и `GET /verification/status` через `requireProfile()` / `getVerificationRequest()`.
- **Эндпоинты** (сверены с `routes/api.php`, FormRequest'ами и ресурсами hoffman-backend): `PATCH /profile {name}`; `PATCH /profile/email {new_email}` → `POST /profile/email/confirm {code}` (`INVALID_CODE`, `CODE_EXPIRED`, `TOO_MANY_ATTEMPTS`, `EMAIL_TAKEN`); `PATCH /profile/password {old_password, password}` (`INVALID_OLD_PASSWORD`); `POST /profile/deletion-request` (удаление через 30 дней, `DELETION_ALREADY_REQUESTED`) и `DELETE /profile` (сразу, 204); `GET /legal-documents`, `GET /legal-documents/{slug}` (публичные, ответ в `data`, `body` — HTML из RichEditor, на сайте очищается `sanitize-html`).
- **Статус выпускника** берётся из `profile.graduate_status` — по нему backend открывает доступ (`AccessLevelService`, дневник). «Начать» открывает верификацию на `POST /verification/submit {last_name, first_name, phone}` — тот же эндпоинт, что в мобильном приложении (`VerificationRepository.submit`); он не зависит от платформы, отдельный веб-эндпоинт не нужен.
- **Что стоит доделать на backend:** смена пароля не отзывает остальные токены (`ProfileService::updatePassword`) — сессии на других устройствах остаются; у отложенного удаления нет ни отмены, ни признака в `GET /profile` — сайт узнаёт о запросе только по `DELETION_ALREADY_REQUESTED`; среди документов нет `offer` и `personal-data`, на которые ссылаются футер и согласия (`/legal/offer`, `/legal/personal-data` отдают 404).
