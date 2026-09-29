import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

describe("SiteHeader", () => {
  it("содержит пункты шапки из макета", () => {
    render(<SiteHeader />);
    const nav = screen.getByRole("navigation", { name: "Основная навигация" });
    expect(within(nav).getByRole("link", { name: "Начать бесплатно" })).toHaveAttribute("href", "/register");
    expect(within(nav).getByRole("link", { name: "Скачать приложение" })).toHaveAttribute("href", "#download-app");
    expect(within(nav).getByRole("link", { name: "Войти" })).toHaveAttribute("href", "/login");
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
