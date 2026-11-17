import { test, expect } from "@playwright/test";

// Макеты есть только для 1440px; мобильная и планшетная раскладки выведены из них.
// Проверяем главное требование: ни на одной ширине нет горизонтальной прокрутки.
const WIDTHS = [320, 390, 768, 1024, 1440];
const PAGES = ["/", "/legal"];

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

test.describe("мобильная раскладка лендинга (390px)", () => {
  test.use({ viewport: { width: 390, height: 800 } });

  test("«О приложении»: текст от левого поля сетки", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("section", { has: page.getByRole("heading", { name: /Мобильное приложение hoffman/ }) });
    const text = await section.getByText(/Все под рукой/).boundingBox();
    expect(text!.x).toBe(16);
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

  test("«Скачать приложение»: «Скоро в App Store и Google Play» во всю ширину сетки", async ({ page }) => {
    await page.goto("/");
    const soon = await page.locator("#download").getByText("Скоро в App Store и Google Play").boundingBox();
    expect(soon!.x).toBe(16);
    expect(soon!.width).toBe(358);
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
