import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./LoginForm";
import { apiError, jsonResponse, mockFetch, requestBody } from "../test/utils";

const router = { replace: vi.fn(), refresh: vi.fn() };
vi.mock("next/navigation", () => ({ useRouter: () => router }));

async function fillAndSubmit(email: string, password: string, { consents = true } = {}) {
  const user = userEvent.setup();
  if (email) await user.type(screen.getByLabelText("Email"), email);
  if (password) await user.type(screen.getByLabelText("Пароль"), password);
  if (consents) {
    await user.click(screen.getByLabelText(/политикой конфиденциальности/));
    await user.click(screen.getByLabelText(/обработку моих персональных данных/));
  }
  await user.click(screen.getByRole("button", { name: "Войти" }));
}

describe("LoginForm", () => {
  beforeEach(() => {
    router.replace.mockReset();
    router.refresh.mockReset();
  });
  afterEach(() => vi.unstubAllGlobals());

  it("показывает ссылку «Забыли пароль?»", () => {
    render(<LoginForm />);
    expect(screen.getByRole("link", { name: "Забыли пароль?" })).toHaveAttribute("href", "/forgot-password");
  });

  it("не отправляет форму с пустыми полями", async () => {
    const fetchMock = mockFetch();
    render(<LoginForm />);
    await fillAndSubmit("", "");
    expect(screen.getByText("Заполните email")).toBeInTheDocument();
    expect(screen.getByText("Заполните пароль")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("требует принять условия", async () => {
    const fetchMock = mockFetch();
    render(<LoginForm />);
    await fillAndSubmit("anna@example.com", "secret1!", { consents: false });
    expect(screen.getByText("Примите условия чтобы продолжить")).toBeInTheDocument();
    expect(screen.getByLabelText(/политикой конфиденциальности/)).toHaveAttribute("aria-invalid", "true");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("показывает ошибку формата email", async () => {
    mockFetch();
    render(<LoginForm />);
    await fillAndSubmit("user@mail", "secret");
    expect(screen.getByLabelText("Email")).toHaveAccessibleDescription("Неверный формат email");
  });

  it("входит и переходит в личный кабинет", async () => {
    const fetchMock = mockFetch(jsonResponse(200, { user: { id: 1, name: "Anna" } }));
    render(<LoginForm />);
    await fillAndSubmit(" anna@example.com ", "secret1!");

    expect(fetchMock).toHaveBeenCalledWith("/api/auth/login", expect.objectContaining({ method: "POST" }));
    expect(requestBody(fetchMock)).toEqual({ email: "anna@example.com", password: "secret1!" });
    expect(router.replace).toHaveBeenCalledWith("/dashboard");
  });

  it("показывает «Неверный email или пароль» на INVALID_CREDENTIALS", async () => {
    mockFetch(apiError(401, "INVALID_CREDENTIALS"));
    render(<LoginForm />);
    await fillAndSubmit("anna@example.com", "wrong");
    expect(await screen.findByText("Неверный email или пароль")).toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("показывает время ожидания при 429", async () => {
    mockFetch(apiError(429, "TOO_MANY_REQUESTS", {}, { "Retry-After": "120" }));
    render(<LoginForm />);
    await fillAndSubmit("anna@example.com", "wrong");
    expect(await screen.findByRole("alert")).toHaveTextContent("Слишком много попыток. Попробуйте через 2 минуты");
  });

  it("сообщает о заблокированном аккаунте", async () => {
    mockFetch(apiError(403, "ACCOUNT_BLOCKED"));
    render(<LoginForm />);
    await fillAndSubmit("anna@example.com", "secret1!");
    expect(await screen.findByRole("alert")).toHaveTextContent("Аккаунт заблокирован");
  });

  it("сообщает об отсутствии сети", async () => {
    mockFetch(new TypeError("Failed to fetch"));
    render(<LoginForm />);
    await fillAndSubmit("anna@example.com", "secret1!");
    expect(await screen.findByRole("alert")).toHaveTextContent("Нет соединения");
  });

  it("показывает ошибку входа через Apple/Google, переданную со страницы", () => {
    render(<LoginForm initialError="Не удалось войти через Google. Попробуйте снова" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Не удалось войти через Google");
  });
});
