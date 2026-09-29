import { test, expect } from "@playwright/test";

test("лендинг: кнопка пробного периода ведёт на регистрацию после согласий", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "hoffman" })).toBeVisible();

  const cta = page.getByRole("link", { name: "Попробовать 7 дней бесплатно" });
  await cta.click();
  await expect(page.getByText("Примите условия чтобы продолжить")).toBeVisible();
  await expect(page).toHaveURL(/\/$/);

  await page.getByLabel("Я ознакомлен с политикой конфиденциальности").check();
  await page.getByLabel("Я согласен на обработку моих персональных данных").check();
  await cta.click();
  await expect(page).toHaveURL(/\/register$/);
});

test("лендинг: шапка ведёт на вход и регистрацию", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Основная навигация" });

  await nav.getByRole("link", { name: "Войти" }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.goto("/");
  await page.getByRole("main").getByRole("link", { name: "Начать бесплатно" }).click();
  await expect(page).toHaveURL(/\/register$/);
});

test("тарифы открываются из футера", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("contentinfo").getByRole("link", { name: "Тарифы" }).click();
  await expect(page).toHaveURL(/\/pricing$/);
  await expect(page.getByRole("heading", { name: "Тарифы" })).toBeVisible();
});
