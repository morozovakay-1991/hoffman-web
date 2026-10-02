import { test, expect, type Page } from "@playwright/test";

// Адрес заглушки backend из playwright.config.ts.
const MOCK_BACKEND = "http://127.0.0.1:4010";

/** Каждый тест — на своём пользователе: заглушка хранит состояние между тестами. */
async function registerAndOpenProfile(page: Page) {
  const email = `profile+${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
  await page.goto("/register");
  await page.getByLabel("Имя").fill("Мария");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Пароль", { exact: true }).fill("Secret123!");
  await page.getByLabel("Повторите пароль").fill("Secret123!");
  await page.getByLabel("Я ознакомлен с политикой конфиденциальности").check();
  await page.getByLabel("Я согласен на обработку моих персональных данных").check();
  await page.getByRole("button", { name: "Зарегистрироваться" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  return email;
}

test("смена email с подтверждением кодом", async ({ page, request }) => {
  const oldEmail = await registerAndOpenProfile(page);
  const newEmail = oldEmail.replace("profile+", "renamed+");

  await expect(page.getByRole("heading", { name: "Личные данные" })).toBeVisible();
  await expect(page.getByText("Пройдите верификацию и получите доступ к расширенным возможностям приложения")).toBeVisible();
  await expect(page.getByRole("button", { name: /^Email/ })).toContainText(oldEmail);

  await page.getByRole("button", { name: /^Email/ }).click();
  const emailDialog = page.getByRole("dialog", { name: "Email" });
  await emailDialog.getByLabel("Новый email").fill(newEmail);
  await emailDialog.getByRole("button", { name: "Сохранить" }).click();

  const codeDialog = page.getByRole("dialog", { name: "Введите код" });
  await expect(codeDialog).toContainText(`Мы отправили 6-значный код на ${newEmail}`);
  const { code } = await (await request.get(`${MOCK_BACKEND}/__test/email-code?email=${encodeURIComponent(newEmail)}`)).json();
  expect(code).toMatch(/^\d{6}$/);

  for (const [index, digit] of [...code].entries()) {
    await codeDialog.getByLabel(`Цифра ${index + 1} из 6`).fill(digit);
  }
  await codeDialog.getByRole("button", { name: "Отправить код" }).click();

  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("status")).toHaveText("Email изменен");
  await expect(page.getByRole("button", { name: /^Email/ })).toContainText(newEmail);

  // Новый email сохранён на backend: вход по нему работает.
  await page.reload();
  await expect(page.getByRole("button", { name: /^Email/ })).toContainText(newEmail);
});

test("немедленное удаление аккаунта", async ({ page }) => {
  const email = await registerAndOpenProfile(page);

  await page.getByRole("link", { name: /Удаление аккаунта и данных/ }).click();
  await expect(page).toHaveURL(/\/dashboard\/delete-account$/);
  await expect(page.getByRole("heading", { name: "Удаление аккаунта" })).toBeVisible();

  await page.getByRole("button", { name: "Удалить аккаунт" }).click();
  const dialog = page.getByRole("dialog", { name: "Вы уверены?" });
  await expect(dialog).toContainText("Данные будут удалены безвозвратно");
  await dialog.getByRole("button", { name: "Удалить аккаунт" }).click();

  await expect(page).toHaveURL(/\/account-deleted$/);
  await expect(page.getByRole("heading", { name: "Ваш аккаунт удален" })).toBeVisible();
  const session = (await page.context().cookies()).find((cookie) => cookie.name === "hoffman_session");
  expect(session?.value ?? "").toBe("");

  // Кабинет закрыт, а войти удалённым аккаунтом нельзя.
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Пароль").fill("Secret123!");
  await page.getByLabel("Я ознакомлен с политикой конфиденциальности").check();
  await page.getByLabel("Я согласен на обработку моих персональных данных").check();
  await page.getByRole("button", { name: "Войти", exact: true }).click();
  await expect(page.getByText("Неверный email или пароль")).toBeVisible();
});
