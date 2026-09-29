# hoffman-web

Веб-приложение Hoffman на Next.js 16 (App Router) + TypeScript + Tailwind CSS.

## Структура

- `app/(public)/` — публичные страницы (лендинг, тарифы)
- `app/(auth)/` — вход и регистрация
- `app/(dashboard)/` — личный кабинет (доступен после входа)

Бренд-шрифт — [Golos Text](https://fonts.google.com/specimen/Golos+Text) (единый с мобильным приложением, см. документ-план, раздел 11.2), подключён через `next/font/google` в `app/layout.tsx`. Монохромная палитра (чёрный/белый/серые) настроена в `tailwind.config.ts`.

## Разработка

```bash
npm install
cp .env.example .env.local   # адрес hoffman-backend и ключи Apple / Google
npm run dev
```

Авторизация — BFF-прокси: браузер ходит только в `app/api/auth/*`, токен Laravel хранится в httpOnly cookie (см. `docs/plan.md`). Код фичи — `features/auth/`.

Открыть [http://localhost:3000](http://localhost:3000).

## Тесты

Юнит/компонентные тесты (Vitest + Testing Library):

```bash
npm run test
```

End-to-end тесты (Playwright):

```bash
npx playwright install # один раз, если браузеры ещё не установлены
npx playwright test
```

Для e2e авторизации Playwright поднимает заглушку backend (`e2e/mock-backend.mjs`) и `next dev` с `HOFFMAN_API_URL`, указывающим на неё. Локально уже запущенный `next dev` переиспользуется — остановите его, если он смотрит в настоящий backend.
