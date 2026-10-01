import { test, expect, type Page } from "@playwright/test";

// Пользователь, заранее созданный в e2e/mock-backend.mjs.
const DEMO = { email: "demo@hoffman.test", password: "Secret123!" };

async function acceptConsents(page: Page) {
  await page.getByLabel("Я ознакомлен с политикой конфиденциальности").check();
  await page.getByLabel("Я согласен на обработку моих персональных данных").check();
}

async function expectHttpOnlySession(page: Page) {
  const session = (await page.context().cookies()).find((cookie) => cookie.name === "hoffman_session");
  expect(session?.httpOnly).toBe(true);
  // Токен недоступен из JS страницы.
  expect(await page.evaluate(() => document.cookie)).not.toContain("hoffman_session");
}

test("регистрация по email и паролю ведёт в личный кабинет", async ({ page }) => {
  const email = `anna+${Date.now()}@example.com`;

  await page.goto("/register");
  await page.getByLabel("Имя").fill("Anna");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Пароль", { exact: true }).fill("Secret123!");
  await page.getByLabel("Повторите пароль").fill("Secret123!");
  await acceptConsents(page);
  await page.getByRole("button", { name: "Зарегистрироваться" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("button", { name: /^Имя пользователя/ })).toContainText("Anna");
  await expectHttpOnlySession(page);
});

test("вход по email и паролю, затем выход", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("link", { name: "Войти через Apple ID" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Войти через Google" })).toBeVisible();

  await page.getByLabel("Email").fill(DEMO.email);
  await page.getByLabel("Пароль").fill(DEMO.password);
  await acceptConsents(page);
  await page.getByRole("button", { name: "Войти", exact: true }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("button", { name: /^Имя пользователя/ })).toContainText("Demo");
  await expectHttpOnlySession(page);

  await page.getByRole("banner").getByRole("button", { name: "Выйти" }).click();
  const dialog = page.getByRole("dialog", { name: "Вы уверены?" });
  await expect(dialog).toContainText("Выйти из аккаунта?");
  await dialog.getByRole("button", { name: "Выйти" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
});

test("неверный пароль не пускает в кабинет", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(DEMO.email);
  await page.getByLabel("Пароль").fill("wrong-password");
  await acceptConsents(page);
  await page.getByRole("button", { name: "Войти", exact: true }).click();

  await expect(page.getByText("Неверный email или пароль")).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});
