import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ForgotPasswordFlow, RESEND_COOLDOWN_SECONDS } from "./ForgotPasswordFlow";
import { apiError, jsonResponse, mockFetch, requestBody } from "../test/utils";

const ok = () => jsonResponse(200, { message: "ok" });

async function submitEmail(user = userEvent.setup(), email = "anna@example.com") {
  await user.type(screen.getByLabelText("Email"), email);
  await user.click(screen.getByRole("button", { name: "Отправить код" }));
}

async function submitCode(user = userEvent.setup(), code = "123456") {
  await screen.findByRole("heading", { name: "Введите код" });
  screen.getByLabelText("Цифра 1 из 6").focus();
  await user.paste(code);
  await user.click(screen.getByRole("button", { name: "Подтвердить" }));
}

async function submitPassword(user = userEvent.setup(), password = "newpass1!", confirmation = password) {
  await screen.findByRole("heading", { name: "Новый пароль" });
  await user.type(screen.getByLabelText("Новый пароль"), password);
  await user.type(screen.getByLabelText("Повторите пароль"), confirmation);
  await user.click(screen.getByRole("button", { name: "Сохранить" }));
}

describe("ForgotPasswordFlow", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("проходит все шаги: email → код → новый пароль → подтверждение", async () => {
    const fetchMock = mockFetch(ok(), ok(), ok());
    const user = userEvent.setup();
    render(<ForgotPasswordFlow />);

    await submitEmail(user);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/auth/password/forgot");
    expect(requestBody(fetchMock, 0)).toEqual({ email: "anna@example.com" });
    expect(await screen.findByText("Мы отправили 6-значный код на anna@example.com")).toBeInTheDocument();

    await submitCode(user);
    expect(fetchMock.mock.calls[1][0]).toBe("/api/auth/password/verify-code");
    expect(requestBody(fetchMock, 1)).toEqual({ email: "anna@example.com", code: "123456" });

    await submitPassword(user);
    expect(fetchMock.mock.calls[2][0]).toBe("/api/auth/password/reset");
    expect(requestBody(fetchMock, 2)).toEqual({
      email: "anna@example.com",
      code: "123456",
      password: "newpass1!",
      password_confirmation: "newpass1!",
    });

    expect(await screen.findByRole("heading", { name: "Пароль изменен" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Войти" })).toHaveAttribute("href", "/login");
  });

  it("проверяет формат email до запроса", async () => {
    const fetchMock = mockFetch();
    render(<ForgotPasswordFlow />);
    await submitEmail(undefined, "anna@");
    expect(screen.getByText("Неверный формат email")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("не отправляет неполный код", async () => {
    const fetchMock = mockFetch(ok());
    const user = userEvent.setup();
    render(<ForgotPasswordFlow />);
    await submitEmail(user);
    await submitCode(user, "123");
    expect(screen.getByText("Введите все 6 цифр кода")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["INVALID_CODE", 422, "Неверный код. Попробуйте снова"],
    ["CODE_EXPIRED", 422, "Код устарел. Запросите новый"],
    ["TOO_MANY_ATTEMPTS", 422, "Слишком много попыток. Запросите новый код"],
  ])("показывает ошибку кода %s", async (code, status, text) => {
    mockFetch(ok(), apiError(status, code));
    const user = userEvent.setup();
    render(<ForgotPasswordFlow />);
    await submitEmail(user);
    await submitCode(user);
    expect(await screen.findByText(text)).toBeInTheDocument();
    expect(screen.getByLabelText("Цифра 1 из 6")).toHaveAttribute("aria-invalid", "true");
  });

  it("возвращает на шаг email с ошибкой «Email не зарегистрирован» на EMAIL_NOT_FOUND", async () => {
    mockFetch(ok(), apiError(404, "EMAIL_NOT_FOUND"));
    const user = userEvent.setup();
    render(<ForgotPasswordFlow />);
    await submitEmail(user, "ghost@example.com");
    await submitCode(user);

    expect(await screen.findByRole("heading", { name: "Сбросить пароль" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAccessibleDescription("Email не зарегистрирован");
    expect(screen.getByLabelText("Email")).toHaveValue("ghost@example.com");
  });

  it("проверяет совпадение и сложность нового пароля", async () => {
    const fetchMock = mockFetch(ok(), ok());
    const user = userEvent.setup();
    render(<ForgotPasswordFlow />);
    await submitEmail(user);
    await submitCode(user);

    await submitPassword(user, "newpass1!", "newpass2!");
    expect(screen.getByText("Пароли не совпадают")).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Новый пароль"));
    await user.type(screen.getByLabelText("Новый пароль"), "short");
    await user.click(screen.getByRole("button", { name: "Сохранить" }));
    expect(screen.getByLabelText("Новый пароль")).toHaveAccessibleDescription(
      expect.stringContaining("Минимум 8 символов, включая цифры и спецсимволы"),
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("возвращает к вводу кода, если код истёк к моменту сохранения пароля", async () => {
    mockFetch(ok(), ok(), apiError(422, "CODE_EXPIRED"));
    const user = userEvent.setup();
    render(<ForgotPasswordFlow />);
    await submitEmail(user);
    await submitCode(user);
    await submitPassword(user);

    expect(await screen.findByRole("heading", { name: "Введите код" })).toBeInTheDocument();
    expect(screen.getByText("Код устарел. Запросите новый")).toBeInTheDocument();
  });

  it("разрешает повторную отправку кода только после таймера", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const fetchMock = mockFetch(ok(), ok());
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ForgotPasswordFlow />);
    await submitEmail(user);

    expect(await screen.findByText(`Отправить еще раз через ${RESEND_COOLDOWN_SECONDS}с`)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Отправить еще раз" })).not.toBeInTheDocument();

    for (let i = 0; i < RESEND_COOLDOWN_SECONDS; i++) {
      await act(() => vi.advanceTimersByTimeAsync(1000));
    }
    await user.click(screen.getByRole("button", { name: "Отправить еще раз" }));

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toBe("/api/auth/password/forgot");
    expect(await screen.findByText(`Отправить еще раз через ${RESEND_COOLDOWN_SECONDS}с`)).toBeInTheDocument();
  });
});
