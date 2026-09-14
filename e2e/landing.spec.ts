import { test, expect } from "@playwright/test";

test("лендинг открывается и ведёт на тарифы", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Hoffman" })).toBeVisible();

  await page.getByRole("link", { name: "Смотреть тарифы" }).click();
  await expect(page).toHaveURL(/\/pricing$/);
  await expect(page.getByRole("heading", { name: "Тарифы" })).toBeVisible();
});
