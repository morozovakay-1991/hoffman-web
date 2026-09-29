import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
      /7 дней бесплатно, дальше на ваш выбор/,
    ]) {
      expect(within(main).getByRole("heading", { level: 2, name })).toBeInTheDocument();
    }
    for (const name of ["Медитации", "Инструменты", "Статьи", "Дневник", "Для всех", "Для выпускников"]) {
      expect(within(main).getByRole("heading", { level: 3, name })).toBeInTheDocument();
    }
  });

  it("шапка ведёт на регистрацию, вход и к блоку загрузки приложения", () => {
    renderLanding();
    const nav = screen.getByRole("navigation", { name: "Основная навигация" });
    expect(within(nav).getByRole("link", { name: "Начать бесплатно" })).toHaveAttribute("href", "/register");
    expect(within(nav).getByRole("link", { name: "Войти" })).toHaveAttribute("href", "/login");
    expect(within(nav).getByRole("link", { name: "Скачать приложение" })).toHaveAttribute("href", "#download");
    expect(document.getElementById("download")).toHaveTextContent("Скачать приложение");
    expect(screen.getByRole("link", { name: "Hoffman — на главную" })).toHaveAttribute("href", "/");
  });

  it("CTA блока «О приложении» ведут на регистрацию и к загрузке", () => {
    const { main } = renderLanding();
    expect(within(main).getByRole("link", { name: "Начать бесплатно" })).toHaveAttribute("href", "/register");
    expect(within(main).getByRole("link", { name: "Скачать приложение" })).toHaveAttribute("href", "#download");
  });

  it("в «Для всех» дневник отмечен как недоступный", () => {
    renderLanding();
    const [forAll, forGraduates] = screen.getAllByRole("article");
    expect(within(forAll).getByText(/Дневник 100 дней/)).toHaveTextContent("— недоступно");
    expect(within(forGraduates).getByText(/Дневник 100 дней/)).not.toHaveTextContent("недоступно");
  });
});

describe("LandingPage — тарифы", () => {
  it("по умолчанию выбран годовой тариф, выбор месячного меняет условия продления", async () => {
    const user = userEvent.setup();
    renderLanding();
    const year = screen.getByRole("radio", { name: /Год/ });
    const month = screen.getByRole("radio", { name: /Месяц/ });
    expect(year).toBeChecked();
    expect(screen.getByText(/Далее 1200 ₽ \/ год\./)).toBeInTheDocument();

    await user.click(month);
    expect(month).toBeChecked();
    expect(year).not.toBeChecked();
    expect(screen.getByText(/Далее 150 ₽ \/ мес\./)).toBeInTheDocument();
  });

  it("«Попробовать 7 дней бесплатно» без согласий не уводит и показывает ошибку", () => {
    renderLanding();
    const cta = screen.getByRole("link", { name: "Попробовать 7 дней бесплатно" });
    expect(cta).toHaveAttribute("href", "/register");

    // fireEvent.click возвращает false, если переход отменён через preventDefault.
    expect(fireEvent.click(cta)).toBe(false);
    expect(screen.getByText("Примите условия чтобы продолжить")).toBeInTheDocument();
  });

  it("«Попробовать 7 дней бесплатно» с согласиями ведёт на регистрацию", async () => {
    const user = userEvent.setup();
    renderLanding();
    await user.click(screen.getByLabelText("Я ознакомлен с политикой конфиденциальности"));
    await user.click(screen.getByLabelText("Я согласен на обработку моих персональных данных"));

    const cta = screen.getByRole("link", { name: "Попробовать 7 дней бесплатно" });
    // Сам переход (Next.js <Link>) проверяется в e2e/landing.spec.ts — здесь только то, что страница его не блокирует.
    await user.click(cta);
    expect(screen.queryByText("Примите условия чтобы продолжить")).not.toBeInTheDocument();
    expect(cta).toHaveAttribute("href", "/register");
  });
});
