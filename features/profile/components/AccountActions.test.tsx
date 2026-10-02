import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { apiError, jsonResponse, mockFetch, requestBody } from "@/features/auth/test/utils";
import { DeleteAccountPanel } from "./DeleteAccountPanel";
import { GraduateBlock } from "./GraduateBlock";
import { LogoutButton } from "./LogoutButton";
import { ProfileMenu } from "./ProfileMenu";

const router = { replace: vi.fn(), refresh: vi.fn() };
let pathname = "/dashboard";
vi.mock("next/navigation", () => ({ useRouter: () => router, usePathname: () => pathname }));

beforeEach(() => {
  router.replace.mockReset();
  router.refresh.mockReset();
  pathname = "/dashboard";
});
afterEach(() => vi.unstubAllGlobals());

describe("DeleteAccountPanel", () => {
  it("отложенное удаление: предупреждение → POST deletion-request → сессия остаётся", async () => {
    const fetchMock = mockFetch(
      jsonResponse(201, { deletion_request: { status: "pending", reason: null, scheduled_for: "2026-10-31", completed_at: null } }),
    );
    const user = userEvent.setup();
    render(<DeleteAccountPanel />);

    await user.click(screen.getByRole("button", { name: "Запросить удаление данных" }));
    const dialog = screen.getByRole("dialog", { name: "Вы уверены?" });
    expect(dialog).toHaveTextContent("Аккаунт и данные будут удалены через 30 дней");
    await user.click(screen.getByRole("button", { name: "Запросить удаление" }));

    expect(fetchMock.mock.calls[0][0]).toBe("/api/profile/deletion-request");
    expect(fetchMock.mock.calls[0][1]?.method).toBe("POST");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Запрос отправлен. Данные будут удалены в течение 30 дней");
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("повторный запрос — сообщение, что он уже отправлен", async () => {
    mockFetch(apiError(422, "DELETION_ALREADY_REQUESTED"));
    const user = userEvent.setup();
    render(<DeleteAccountPanel />);
    await user.click(screen.getByRole("button", { name: "Запросить удаление данных" }));
    await user.click(screen.getByRole("button", { name: "Запросить удаление" }));
    expect(screen.getByRole("status")).toHaveTextContent("Запрос на удаление данных уже отправлен");
  });

  it("немедленное удаление: «Данные будут удалены безвозвратно» → DELETE → экран удалённого аккаунта", async () => {
    const fetchMock = mockFetch(new Response(null, { status: 204 }));
    const user = userEvent.setup();
    render(<DeleteAccountPanel />);

    await user.click(screen.getByRole("button", { name: "Удалить аккаунт" }));
    expect(screen.getByRole("dialog", { name: "Вы уверены?" })).toHaveTextContent("Данные будут удалены безвозвратно");
    await user.click(screen.getAllByRole("button", { name: "Удалить аккаунт" }).at(-1)!);

    expect(fetchMock.mock.calls[0][0]).toBe("/api/profile");
    expect(fetchMock.mock.calls[0][1]?.method).toBe("DELETE");
    expect(router.replace).toHaveBeenCalledWith("/account-deleted");
  });

  it("«Отменить» ничего не удаляет, ошибка удаления остаётся в модалке", async () => {
    const fetchMock = mockFetch(apiError(500, "SERVER_ERROR"));
    const user = userEvent.setup();
    render(<DeleteAccountPanel />);

    await user.click(screen.getByRole("button", { name: "Удалить аккаунт" }));
    await user.click(screen.getByRole("button", { name: "Отменить" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Удалить аккаунт" }));
    await user.click(screen.getAllByRole("button", { name: "Удалить аккаунт" }).at(-1)!);
    expect(screen.getByRole("alert")).toHaveTextContent("Что-то пошло не так. Попробуйте позже");
    expect(router.replace).not.toHaveBeenCalled();
  });
});

describe("GraduateBlock", () => {
  it("подтверждённому выпускнику CTA не показывается", () => {
    render(<GraduateBlock status="confirmed" previousRequest={null} />);
    expect(screen.getByText("Выпускник Процесса Хоффмана")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Начать" })).not.toBeInTheDocument();
  });

  it.each(["unverified", "pending", "rejected"] as const)("статус %s — CTA верификации", (status) => {
    render(<GraduateBlock status={status} previousRequest={null} />);
    expect(screen.getByText("Пройдите верификацию и получите доступ к расширенным возможностям приложения")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Начать" })).toBeInTheDocument();
  });

  it("«Начать» отправляет данные в POST /verification/submit и показывает подтверждение", async () => {
    const fetchMock = mockFetch(jsonResponse(200, { verification_request: { id: 1, status: "confirmed" } }));
    const user = userEvent.setup();
    render(
      <GraduateBlock
        status="unverified"
        previousRequest={{ id: 1, status: "pending", last_name: "Иванов", first_name: "Пётр", phone: "+79001234567" } as never}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Начать" }));
    expect(screen.getByLabelText("Фамилия")).toHaveValue("Иванов");

    await user.click(screen.getByRole("button", { name: "Далее" }));
    expect(screen.getByText("Примите условия чтобы продолжить")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();

    await user.click(screen.getByLabelText(/политикой конфиденциальности/));
    await user.click(screen.getByLabelText(/обработку моих персональных данных/));
    await user.click(screen.getByRole("button", { name: "Далее" }));

    expect(fetchMock.mock.calls[0][0]).toBe("/api/verification/submit");
    expect(requestBody(fetchMock)).toEqual({ last_name: "Иванов", first_name: "Пётр", phone: "+79001234567" });
    expect(screen.getByRole("dialog", { name: "Статус подтвержден" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Готово" }));
    expect(router.refresh).toHaveBeenCalled();
  });

  it("нет совпадения — «Статус не подтвержден» с повтором и связью с администратором", async () => {
    mockFetch(jsonResponse(200, { verification_request: { id: 1, status: "pending" } }));
    const user = userEvent.setup();
    render(<GraduateBlock status="unverified" previousRequest={null} />);

    await user.click(screen.getByRole("button", { name: "Начать" }));
    await user.click(screen.getByRole("button", { name: "Далее" }));
    expect(screen.getByLabelText("Фамилия")).toHaveAccessibleDescription("Заполните фамилию");
    expect(screen.getByLabelText("Номер телефона")).toHaveAccessibleDescription(/Заполните номер телефона/);

    await user.type(screen.getByLabelText("Фамилия"), "Иванов");
    await user.type(screen.getByLabelText("Имя"), "Пётр");
    await user.type(screen.getByLabelText("Номер телефона"), "89001234567");
    await user.click(screen.getByLabelText(/политикой конфиденциальности/));
    await user.click(screen.getByLabelText(/обработку моих персональных данных/));
    await user.click(screen.getByRole("button", { name: "Далее" }));

    expect(screen.getByRole("dialog", { name: "Статус не подтвержден" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Написать администратору" })).toHaveAttribute("href", "mailto:admin@hoffman-institut.ru");
    await user.click(screen.getByRole("button", { name: "Попробовать снова" }));
    expect(screen.getByLabelText("Фамилия")).toHaveValue("Иванов");
  });
});

describe("LogoutButton", () => {
  it("спрашивает подтверждение и выходит через POST /api/auth/logout", async () => {
    const user = userEvent.setup();
    render(<LogoutButton variant="header" />);

    await user.click(screen.getByRole("button", { name: "Выйти" }));
    const dialog = screen.getByRole("dialog", { name: "Вы уверены?" });
    expect(dialog).toHaveTextContent("Выйти из аккаунта?");
    expect(screen.getByRole("button", { name: "Отменить" })).toHaveFocus();

    const submit = screen.getAllByRole("button", { name: "Выйти" }).at(-1)!;
    expect(submit).toHaveAttribute("type", "submit");
    expect(submit.closest("form")).toHaveAttribute("action", "/api/auth/logout");
    expect(submit.closest("form")).toHaveAttribute("method", "post");

    await user.click(screen.getByRole("button", { name: "Назад" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("ProfileMenu", () => {
  it("отмечает текущий раздел и не делает ссылками разделы без страниц", () => {
    pathname = "/dashboard/delete-account";
    render(<ProfileMenu />);
    expect(screen.getByRole("link", { name: "Личные данные" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Правовая информация" })).not.toHaveAttribute("aria-current");
    expect(screen.queryByRole("link", { name: "Подписка" })).not.toBeInTheDocument();
    expect(screen.getByText("Подписка")).toBeInTheDocument();
  });
});
