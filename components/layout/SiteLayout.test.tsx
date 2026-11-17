import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

describe("SiteHeader", () => {
  it("шапка — только лого", () => {
    render(<SiteHeader />);
    const banner = screen.getByRole("banner");
    const links = within(banner).getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName("Hoffman — на главную");
    expect(links[0]).toHaveAttribute("href", "/");
    expect(screen.queryByRole("navigation", { name: "Основная навигация" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Меню" })).not.toBeInTheDocument();
  });
});

describe("SiteFooter", () => {
  it("содержит копирайт, контакты, разделы, документы и «Скоро в App Store и Google Play»", () => {
    render(<SiteFooter />);
    expect(screen.getByText(/© 1991-\d{4} Hoffman Institute International/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "admin@hoffman-institut.ru" })).toHaveAttribute(
      "href",
      "mailto:admin@hoffman-institut.ru",
    );
    expect(screen.getByRole("link", { name: "Политика конфиденциальности" })).toHaveAttribute("href", "/legal/privacy");
    expect(screen.getByText("Скоро в App Store и Google Play")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Тарифы" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Личный кабинет" })).not.toBeInTheDocument();
  });

  it("кнопка «Публичная оферта» открывает модалку, Esc закрывает её и возвращает фокус на кнопку", async () => {
    const user = userEvent.setup();
    render(<SiteFooter />);
    const button = screen.getByRole("button", { name: "Публичная оферта" });

    await user.click(button);
    const dialog = screen.getByRole("dialog", { name: "Публичная оферта" });
    expect(within(dialog).getByText(/Lorem ipsum/)).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(button).toHaveFocus();
  });
});
