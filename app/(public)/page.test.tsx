import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import LandingPage from "./page";

function renderLanding() {
  render(<LandingPage />);
  return { main: screen.getByRole("main") };
}

describe("LandingPage", () => {
  it("рендерит секции лендинга с текстом из макета", () => {
    const { main } = renderLanding();
    expect(within(main).getByRole("heading", { level: 1, name: "hoffman" })).toBeInTheDocument();
    expect(within(main).getByText("Ежедневная внутренняя работа в вашем кармане")).toBeInTheDocument();
    for (const name of [
      /Мобильное приложение hoffman/,
      "Возможности",
      /Начните с одной практики в день/,
      "Как устроен доступ",
    ]) {
      expect(within(main).getByRole("heading", { level: 2, name })).toBeInTheDocument();
    }
    for (const name of ["Медитации", "Инструменты", "Статьи", "Дневник", "Для всех", "Для выпускников"]) {
      expect(within(main).getByRole("heading", { level: 3, name })).toBeInTheDocument();
    }
  });

  it("шапка — только лого", () => {
    renderLanding();
    const banner = screen.getByRole("banner");
    const links = within(banner).getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName("Hoffman — на главную");
    expect(links[0]).toHaveAttribute("href", "/");
    expect(screen.queryByRole("navigation", { name: "Основная навигация" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Меню" })).not.toBeInTheDocument();
  });

  it("в main нет CTA «Начать бесплатно» и «Скачать приложение», в блоке загрузки — «Скоро в App Store и Google Play»", () => {
    const { main } = renderLanding();
    expect(within(main).queryByRole("link", { name: "Начать бесплатно" })).not.toBeInTheDocument();
    expect(within(main).queryByRole("link", { name: "Скачать приложение" })).not.toBeInTheDocument();
    expect(within(document.getElementById("download")!).getByText("Скоро в App Store и Google Play")).toBeInTheDocument();
  });

  it("«Возможности» — подписанный горизонтальный слайдер с четырьмя карточками, фокусируемый с клавиатуры", () => {
    renderLanding();
    // В jsdom нет раскладки, поэтому ScrollRegion остаётся в мобильном (прокручиваемом) состоянии.
    const slider = screen.getByRole("region", { name: /Возможности приложения/ });
    expect(slider).toHaveAttribute("tabindex", "0");
    expect(within(slider).getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Медитации",
      "Инструменты",
      "Статьи",
      "Дневник",
    ]);
  });

  it("в «Для всех» дневник отмечен как недоступный", () => {
    renderLanding();
    const [forAll, forGraduates] = screen.getAllByRole("article");
    expect(within(forAll).getByText(/Дневник 100 дней/)).toHaveTextContent("— недоступно");
    expect(within(forGraduates).getByText(/Дневник 100 дней/)).not.toHaveTextContent("недоступно");
  });
});
