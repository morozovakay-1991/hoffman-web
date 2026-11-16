import { test, expect } from "@playwright/test";

// Макеты есть только для 1440px; мобильная и планшетная раскладки выведены из них.
// Проверяем главное требование: ни на одной ширине нет горизонтальной прокрутки.
const WIDTHS = [320, 390, 768, 1024, 1440];
const PAGES = ["/", "/legal", "/login", "/register", "/forgot-password", "/account-deleted"];

for (const width of WIDTHS) {
  test(`нет горизонтальной прокрутки на ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    for (const path of PAGES) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${path} на ${width}px`).toBeLessThanOrEqual(0);
    }
  });
}

test("бургер-меню на мобильном работает с клавиатуры", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/login");
  const toggle = page.getByRole("button", { name: "Меню" });
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Начать бесплатно" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toBeFocused();
});

test.describe("мобильная раскладка лендинга (390px)", () => {
  test.use({ viewport: { width: 390, height: 800 } });

  test("«О приложении»: текст над кнопками, кнопки во всю ширину столбиком", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("section", { has: page.getByRole("heading", { name: /Мобильное приложение hoffman/ }) });
    const text = await section.getByText(/Все под рукой/).boundingBox();
    const start = await section.getByRole("link", { name: "Начать бесплатно" }).boundingBox();
    const download = await section.getByRole("link", { name: "Скачать приложение" }).boundingBox();
    expect(text!.y).toBeLessThan(start!.y);
    expect(start!.y).toBeLessThan(download!.y);
    // Поля сетки 16px: кнопки от 16 до 374.
    for (const button of [start!, download!]) {
      expect(button.x).toBe(16);
      expect(button.width).toBe(358);
    }
  });

  test("«Возможности»: прокручивается только слайдер, стрелками с клавиатуры", async ({ page }) => {
    await page.goto("/");
    const slider = page.getByRole("region", { name: /Возможности приложения/ });
    await slider.focus();
    await expect(slider).toBeFocused();
    expect(await slider.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => slider.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  });

  test("«Скачать приложение»: бейджи в ряд, по половине сетки с зазором 8px", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#download");
    const appStore = await section.getByRole("img", { name: "Загрузить в App Store" }).boundingBox();
    const googlePlay = await section.getByRole("img", { name: "Скачать из Google Play" }).boundingBox();
    expect(appStore!.x).toBe(16);
    expect(appStore!.y).toBe(googlePlay!.y);
    expect(appStore!.width).toBe(175);
    expect(googlePlay!.width).toBe(175);
    expect(googlePlay!.x - (appStore!.x + appStore!.width)).toBe(8);
  });

  test("«Как устроен доступ»: карточки друг под другом во всю ширину сетки", async ({ page }) => {
    await page.goto("/");
    const [forAll, forGraduates] = await page.getByRole("article").all();
    const a = await forAll.boundingBox();
    const b = await forGraduates.boundingBox();
    expect(a!.x).toBe(16);
    expect(a!.width).toBe(358);
    expect(b!.x).toBe(16);
    expect(b!.y).toBeGreaterThan(a!.y + a!.height);
  });
});
