import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { apiError, jsonResponse, mockFetch, requestBody } from "@/features/auth/test/utils";
import { ChangeEmailDialog } from "./ChangeEmailDialog";
import { ChangePasswordDialog } from "./ChangePasswordDialog";
import { EditNameDialog } from "./EditNameDialog";
import { PersonalDataPanel } from "./PersonalDataPanel";

const router = { replace: vi.fn(), refresh: vi.fn() };
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const PROFILE = { id: 1, name: "Алексей", email: "alex@example.com", graduate_status: "unverified" };

beforeEach(() => {
  router.replace.mockReset();
  router.refresh.mockReset();
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

async function typeCode(user: ReturnType<typeof userEvent.setup>, code: string) {
  await user.click(screen.getByLabelText("Цифра 1 из 6"));
  await user.paste(code);
}

describe("PersonalDataPanel", () => {
  it("показывает текущие имя и email и открывает модалки", async () => {
    const user = userEvent.setup();
    render(<PersonalDataPanel profile={PROFILE} />);

    expect(screen.getByRole("button", { name: /Имя пользователя/ })).toHaveTextContent("Алексей");
    expect(screen.getByRole("button", { name: /Email/ })).toHaveTextContent("alex@example.com");
    expect(screen.getByRole("link", { name: /Удаление аккаунта и данных/ })).toHaveAttribute("href", "/dashboard/delete-account");

    await user.click(screen.getByRole("button", { name: /Пароль/ }));
    expect(screen.getByRole("dialog", { name: "Пароль" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("после сохранения имени закрывает модалку и сообщает об успехе", async () => {
    mockFetch(jsonResponse(200, { profile: { ...PROFILE, name: "Лёша" } }));
    const user = userEvent.setup();
    render(<PersonalDataPanel profile={PROFILE} />);

    await user.click(screen.getByRole("button", { name: /Имя пользователя/ }));
    const name = screen.getByLabelText("Имя");
    await user.clear(name);
    await user.type(name, "Лёша");
    await user.click(screen.getByRole("button", { name: "Сохранить" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Имя сохранено");
    expect(router.refresh).toHaveBeenCalled();
  });
});

describe("EditNameDialog", () => {
  it("предзаполняет имя и не отправляет пустое", async () => {
    const fetchMock = mockFetch();
    const user = userEvent.setup();
    render(<EditNameDialog currentName="Алексей" onClose={vi.fn()} onSaved={vi.fn()} />);

    expect(screen.getByLabelText("Имя")).toHaveValue("Алексей");
    await user.clear(screen.getByLabelText("Имя"));
    await user.click(screen.getByRole("button", { name: "Сохранить" }));
    expect(screen.getByLabelText("Имя")).toHaveAccessibleDescription("Заполните имя");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("отправляет PATCH /api/profile без кода подтверждения", async () => {
    const fetchMock = mockFetch(jsonResponse(200, { profile: PROFILE }));
    const onSaved = vi.fn();
    const user = userEvent.setup();
    render(<EditNameDialog currentName="" onClose={vi.fn()} onSaved={onSaved} />);

    await user.type(screen.getByLabelText("Имя"), "  Анна ");
    await user.click(screen.getByRole("button", { name: "Сохранить" }));

    expect(fetchMock.mock.calls[0][0]).toBe("/api/profile");
    expect(fetchMock.mock.calls[0][1]?.method).toBe("PATCH");
    expect(requestBody(fetchMock)).toEqual({ name: "Анна" });
    expect(onSaved).toHaveBeenCalledWith("Имя сохранено");
  });

  it("ошибка валидации backend — у поля, 429 — над кнопками", async () => {
    mockFetch(apiError(422, "VALIDATION_ERROR", { name: ["too long"] }), apiError(429, "TOO_MANY_REQUESTS", {}, { "Retry-After": "120" }));
    const user = userEvent.setup();
    render(<EditNameDialog currentName="Анна" onClose={vi.fn()} onSaved={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Сохранить" }));
    expect(screen.getByLabelText("Имя")).toHaveAccessibleDescription("Проверьте введенные данные");

    await user.click(screen.getByRole("button", { name: "Сохранить" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Слишком много попыток. Попробуйте через 2 минуты");
  });

  it("истёкшая сессия ведёт на вход", async () => {
    mockFetch(apiError(401, "UNAUTHENTICATED"));
    const user = userEvent.setup();
    render(<EditNameDialog currentName="Анна" onClose={vi.fn()} onSaved={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Сохранить" }));
    expect(router.replace).toHaveBeenCalledWith("/login");
  });
});

describe("ChangeEmailDialog", () => {
  it("не отправляет текущий email и неверный формат", async () => {
    const fetchMock = mockFetch();
    const user = userEvent.setup();
    render(<ChangeEmailDialog currentEmail="alex@example.com" onClose={vi.fn()} onSaved={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Сохранить" }));
    expect(screen.getByLabelText("Новый email")).toHaveAccessibleDescription("Это ваш текущий email");

    await user.clear(screen.getByLabelText("Новый email"));
    await user.type(screen.getByLabelText("Новый email"), "new@mail");
    await user.click(screen.getByRole("button", { name: "Сохранить" }));
    expect(screen.getByLabelText("Новый email")).toHaveAccessibleDescription("Неверный формат email");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("занятый email — ошибка у поля, код не запрашивается повторно", async () => {
    mockFetch(apiError(422, "EMAIL_TAKEN", { new_email: ["taken"] }));
    const user = userEvent.setup();
    render(<ChangeEmailDialog currentEmail="alex@example.com" onClose={vi.fn()} onSaved={vi.fn()} />);

    await user.clear(screen.getByLabelText("Новый email"));
    await user.type(screen.getByLabelText("Новый email"), "taken@example.com");
    await user.click(screen.getByRole("button", { name: "Сохранить" }));

    expect(screen.getByLabelText("Новый email")).toHaveAccessibleDescription("Email уже используется");
    expect(screen.queryByRole("dialog", { name: "Введите код" })).not.toBeInTheDocument();
  });

  it("запрашивает код и подтверждает смену кодом из 6 ячеек", async () => {
    const fetchMock = mockFetch(
      jsonResponse(200, { message: "sent" }),
      apiError(422, "INVALID_CODE"),
      jsonResponse(200, { profile: { ...PROFILE, email: "new@example.com" } }),
    );
    const onSaved = vi.fn();
    const user = userEvent.setup();
    render(<ChangeEmailDialog currentEmail="alex@example.com" onClose={vi.fn()} onSaved={onSaved} />);

    await user.clear(screen.getByLabelText("Новый email"));
    await user.type(screen.getByLabelText("Новый email"), "new@example.com");
    await user.click(screen.getByRole("button", { name: "Сохранить" }));

    expect(fetchMock.mock.calls[0][0]).toBe("/api/profile/email");
    expect(fetchMock.mock.calls[0][1]?.method).toBe("PATCH");
    expect(requestBody(fetchMock, 0)).toEqual({ new_email: "new@example.com" });

    const dialog = screen.getByRole("dialog", { name: "Введите код" });
    expect(dialog).toHaveTextContent("Мы отправили 6-значный код на new@example.com");
    expect(within(dialog).getAllByLabelText(/Цифра \d из 6/)).toHaveLength(6);
    expect(dialog).toHaveTextContent("Отправить еще раз через 59с");

    await user.click(screen.getByRole("button", { name: "Отправить код" }));
    expect(screen.getByText("Введите все 6 цифр кода")).toBeInTheDocument();

    await typeCode(user, "111111");
    await user.click(screen.getByRole("button", { name: "Отправить код" }));
    expect(screen.getByText("Неверный код. Попробуйте снова")).toBeInTheDocument();

    await typeCode(user, "654321");
    await user.click(screen.getByRole("button", { name: "Отправить код" }));
    expect(fetchMock.mock.calls[2][0]).toBe("/api/profile/email/confirm");
    expect(requestBody(fetchMock, 2)).toEqual({ code: "654321" });
    expect(onSaved).toHaveBeenCalledWith("Email изменен");
    expect(router.refresh).toHaveBeenCalled();
  });

  it.each([
    ["CODE_EXPIRED", "Код устарел. Запросите новый"],
    ["TOO_MANY_ATTEMPTS", "Слишком много попыток. Запросите новый код"],
  ])("ошибка кода %s", async (code, text) => {
    mockFetch(jsonResponse(200, {}), apiError(422, code));
    const user = userEvent.setup();
    render(<ChangeEmailDialog currentEmail={null} onClose={vi.fn()} onSaved={vi.fn()} />);
    await user.type(screen.getByLabelText("Новый email"), "new@example.com");
    await user.click(screen.getByRole("button", { name: "Сохранить" }));
    await typeCode(user, "123456");
    await user.click(screen.getByRole("button", { name: "Отправить код" }));
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it("повторная отправка доступна после 59 секунд и «Изменить Email» возвращает к адресу", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const fetchMock = mockFetch(jsonResponse(200, {}), jsonResponse(200, {}));
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ChangeEmailDialog currentEmail={null} onClose={vi.fn()} onSaved={vi.fn()} />);
    await user.type(screen.getByLabelText("Новый email"), "new@example.com");
    await user.click(screen.getByRole("button", { name: "Сохранить" }));
    // Ответ fetch (Response.json) резолвится не за один микротик — ждём, пока
    // запрос завершится и запустит обратный отсчёт, иначе тики уйдут впустую.
    await screen.findByText(/Отправить еще раз через \d+с/);

    for (let i = 0; i < 59; i++) await act(() => vi.advanceTimersByTime(1000));
    await user.click(screen.getByRole("button", { name: "Отправить еще раз" }));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(requestBody(fetchMock, 1)).toEqual({ new_email: "new@example.com" });
    // Пока повторный запрос в полёте, «Изменить Email» disabled и клик игнорируется.
    await screen.findByText(/Отправить еще раз через \d+с/);

    await user.click(screen.getByRole("button", { name: "Изменить Email" }));
    expect(screen.getByRole("dialog", { name: "Email" })).toBeInTheDocument();
    expect(screen.getByLabelText("Новый email")).toHaveValue("new@example.com");
  });
});

describe("ChangePasswordDialog", () => {
  async function fill(user: ReturnType<typeof userEvent.setup>, old: string, password: string, confirmation: string) {
    if (old) await user.type(screen.getByLabelText("Старый пароль"), old);
    if (password) await user.type(screen.getByLabelText("Новый пароль"), password);
    if (confirmation) await user.type(screen.getByLabelText("Повторите новый пароль"), confirmation);
    await user.click(screen.getByRole("button", { name: "Сохранить" }));
  }

  it("проверяет поля на клиенте", async () => {
    const fetchMock = mockFetch();
    const user = userEvent.setup();
    render(<ChangePasswordDialog onClose={vi.fn()} onSaved={vi.fn()} />);

    await fill(user, "", "short", "");
    expect(screen.getByLabelText("Старый пароль")).toHaveAccessibleDescription("Заполните пароль");
    expect(screen.getByLabelText("Новый пароль")).toHaveAccessibleDescription("Минимум 8 символов, включая цифры и спецсимволы");

    await user.clear(screen.getByLabelText("Новый пароль"));
    await fill(user, "old", "Secret123!", "Secret123?");
    expect(screen.getByLabelText("Повторите новый пароль")).toHaveAccessibleDescription("Пароли не совпадают");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("отправляет старый и новый пароль (без повтора) и сообщает об успехе", async () => {
    const fetchMock = mockFetch(jsonResponse(200, { message: "ok" }));
    const onSaved = vi.fn();
    const user = userEvent.setup();
    render(<ChangePasswordDialog onClose={vi.fn()} onSaved={onSaved} />);

    await fill(user, "OldSecret1!", "Secret123!", "Secret123!");
    expect(fetchMock.mock.calls[0][0]).toBe("/api/profile/password");
    expect(fetchMock.mock.calls[0][1]?.method).toBe("PATCH");
    expect(requestBody(fetchMock)).toEqual({ old_password: "OldSecret1!", password: "Secret123!" });
    expect(onSaved).toHaveBeenCalledWith("Пароль изменен");
  });

  it("неверный старый пароль — ошибка у поля", async () => {
    mockFetch(apiError(422, "INVALID_OLD_PASSWORD"));
    const user = userEvent.setup();
    render(<ChangePasswordDialog onClose={vi.fn()} onSaved={vi.fn()} />);
    await fill(user, "wrong", "Secret123!", "Secret123!");
    expect(screen.getByLabelText("Старый пароль")).toHaveAccessibleDescription("Неверный пароль");
  });
});
