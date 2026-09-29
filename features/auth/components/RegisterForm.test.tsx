import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegisterForm } from "./RegisterForm";
import { apiError, jsonResponse, mockFetch, requestBody } from "../test/utils";

const router = { replace: vi.fn(), refresh: vi.fn() };
vi.mock("next/navigation", () => ({ useRouter: () => router }));

type Values = { name?: string; email?: string; password?: string; confirmation?: string; consents?: boolean };

async function fillAndSubmit({
  name = "Anna",
  email = "anna@example.com",
  password = "secret1!",
  confirmation = password,
  consents = true,
}: Values) {
  const user = userEvent.setup();
  if (name) await user.type(screen.getByLabelText("Имя"), name);
  if (email) await user.type(screen.getByLabelText("Email"), email);
  if (password) await user.type(screen.getByLabelText("Пароль"), password);
  if (confirmation) await user.type(screen.getByLabelText("Повторите пароль"), confirmation);
  if (consents) {
    await user.click(screen.getByLabelText(/политикой конфиденциальности/));
    await user.click(screen.getByLabelText(/обработку моих персональных данных/));
  }
  await user.click(screen.getByRole("button", { name: "Зарегистрироваться" }));
}

describe("RegisterForm", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    router.replace.mockReset();
  });

  it("отмечает выполненные требования к паролю по мере ввода", async () => {
    render(<RegisterForm />);
    const rules = within(screen.getByRole("list", { name: "Требования к паролю" })).getAllByRole("listitem");
    expect(rules.map((rule) => rule.dataset.met)).toEqual(["false", "false", "false"]);

    await userEvent.type(screen.getByLabelText("Пароль"), "abcdefg1");
    expect(rules.map((rule) => rule.dataset.met)).toEqual(["true", "true", "false"]);
  });

  it("не пропускает пароль, не соответствующий требованиям сложности", async () => {
    const fetchMock = mockFetch();
    render(<RegisterForm />);
    await fillAndSubmit({ password: "password" });
    expect(screen.getByLabelText("Пароль")).toHaveAccessibleDescription(
      expect.stringContaining("Минимум 8 символов, включая цифры и спецсимволы"),
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("требует принять условия", async () => {
    const fetchMock = mockFetch();
    render(<RegisterForm />);
    await fillAndSubmit({ consents: false });
    expect(screen.getByText("Примите условия чтобы продолжить")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("проверяет совпадение паролей", async () => {
    mockFetch();
    render(<RegisterForm />);
    await fillAndSubmit({ confirmation: "secret2!" });
    expect(screen.getByText("Пароли не совпадают")).toBeInTheDocument();
  });

  it("проверяет формат email и имя", async () => {
    mockFetch();
    render(<RegisterForm />);
    await fillAndSubmit({ name: "", email: "anna.example.com" });
    expect(screen.getByText("Заполните имя")).toBeInTheDocument();
    expect(screen.getByText("Неверный формат email")).toBeInTheDocument();
  });

  it("регистрирует и переходит в личный кабинет", async () => {
    const fetchMock = mockFetch(jsonResponse(201, { user: { id: 1, name: "Anna" } }));
    render(<RegisterForm />);
    await fillAndSubmit({});

    expect(fetchMock).toHaveBeenCalledWith("/api/auth/register", expect.anything());
    expect(requestBody(fetchMock)).toEqual({
      name: "Anna",
      email: "anna@example.com",
      password: "secret1!",
      password_confirmation: "secret1!",
    });
    expect(router.replace).toHaveBeenCalledWith("/dashboard");
  });

  it("показывает «Email уже используется» на EMAIL_TAKEN", async () => {
    mockFetch(apiError(422, "EMAIL_TAKEN", { email: ["The email has already been taken."] }));
    render(<RegisterForm />);
    await fillAndSubmit({});
    expect(await screen.findByText("Email уже используется")).toBeInTheDocument();
  });

  it("распознаёт занятый email и в VALIDATION_ERROR (формат мобильного клиента)", async () => {
    mockFetch(apiError(422, "VALIDATION_ERROR", { email: ["The email has already been taken."] }));
    render(<RegisterForm />);
    await fillAndSubmit({});
    expect(await screen.findByText("Email уже используется")).toBeInTheDocument();
  });

  it("раскладывает серверные ошибки валидации по полям", async () => {
    mockFetch(apiError(422, "VALIDATION_ERROR", { password: ["The password format is invalid."] }));
    render(<RegisterForm />);
    await fillAndSubmit({});
    expect(await screen.findByText("Минимум 8 символов, включая цифры и спецсимволы")).toBeInTheDocument();
  });
});
