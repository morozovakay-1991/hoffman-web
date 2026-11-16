import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

describe("SiteHeader", () => {
  it("содержит пункты шапки из макета", () => {
    render(<SiteHeader />);
    const [nav] = screen.getAllByRole("navigation", { name: "Основная навигация" });
    expect(within(nav).getByRole("link", { name: "Начать бесплатно" })).toHaveAttribute("href", "/register");
    expect(within(nav).getByRole("link", { name: "Скачать приложение" })).toHaveAttribute("href", "#download-app");
    expect(within(nav).getByRole("link", { name: "Войти" })).toHaveAttribute("href", "/login");
  });

  it("на узких экранах пункты в бургер-меню: открывается кнопкой, закрывается по Esc и переходу", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);
    const toggle = screen.getByRole("button", { name: "Меню" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    const panel = document.getElementById(toggle.getAttribute("aria-controls")!)!;
    expect(panel).not.toBeVisible();

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(panel).toBeVisible();
    expect(within(panel).getByRole("link", { name: "Начать бесплатно" })).toHaveAttribute("href", "/register");
    expect(within(panel).getByRole("link", { name: "Скачать приложение" })).toHaveAttribute("href", "#download-app");
    expect(within(panel).getByRole("link", { name: "Войти" })).toHaveAttribute("href", "/login");

    await user.keyboard("{Escape}");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveFocus();

    await user.click(toggle);
    await user.click(within(panel).getByRole("link", { name: "Скачать приложение" }));
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});

describe("SiteFooter", () => {
  it("содержит копирайт, контакты, разделы, документы и бейджи сторов", () => {
    render(<SiteFooter />);
    expect(screen.getByText(/© 1991-\d{4} Hoffman Institute International/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "admin@hoffman-institut.ru" })).toHaveAttribute(
      "href",
      "mailto:admin@hoffman-institut.ru",
    );
    expect(screen.getByRole("link", { name: "Тарифы" })).toHaveAttribute("href", "/pricing");
    expect(screen.getByRole("link", { name: "Политика конфиденциальности" })).toHaveAttribute("href", "/legal/privacy");
    expect(screen.getByRole("img", { name: "Загрузить в App Store" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Скачать из Google Play" })).toBeInTheDocument();
  });
});
