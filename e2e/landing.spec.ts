import { test, expect } from "@playwright/test";

test("лендинг: в шапке только лого, «Скоро в App Store и Google Play» в блоке загрузки и в футере, тарифов нет", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("banner").getByRole("link")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Меню" })).toHaveCount(0);
  await expect(page.locator("#download").getByText("Скоро в App Store и Google Play")).toBeVisible();
  const footer = page.getByRole("contentinfo");
  await expect(footer.getByText("Скоро в App Store и Google Play")).toBeVisible();
  await expect(footer.getByRole("link", { name: "Тарифы" })).toHaveCount(0);
});

test("политика конфиденциальности открывается из футера", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("contentinfo").getByRole("link", { name: "Политика конфиденциальности" }).click();
  await expect(page).toHaveURL(/\/legal\/privacy$/);
  await expect(page.getByRole("heading", { level: 1, name: "Политика конфиденциальности" })).toBeVisible();
});

test("публичная оферта открывается в модалке из футера и закрывается по Esc", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("contentinfo").getByRole("button", { name: "Публичная оферта" }).click();
  const dialog = page.getByRole("dialog", { name: "Публичная оферта" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});
