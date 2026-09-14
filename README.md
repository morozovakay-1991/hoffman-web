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
npm run dev
```

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
