import { requestJson } from "@/features/auth/api";
import type { DeletionRequest, Profile, VerificationRequest } from "./types";

// Браузер ходит только в Route Handlers `app/api/profile/*` и `app/api/verification/*`:
// они подставляют Bearer-токен из httpOnly cookie на сервере Next.js.

export const profileApi = {
  /** `PATCH /profile` — имя меняется без подтверждения. */
  updateName: (name: string) => requestJson<{ profile: Profile }>("PATCH", "/api/profile", { name }),

  /**
   * `PATCH /profile/email` — код уходит на новый адрес, email меняется только после
   * `confirmEmail`. Повторный вызов заменяет код (так работает «Отправить еще раз»).
   */
  requestEmailChange: (newEmail: string) =>
    requestJson<{ message: string }>("PATCH", "/api/profile/email", { new_email: newEmail }),

  confirmEmail: (code: string) => requestJson<{ profile: Profile }>("POST", "/api/profile/email/confirm", { code }),

  /** `PATCH /profile/password`. Повтор пароля backend не принимает — проверяется на клиенте. */
  updatePassword: (body: { old_password: string; password: string }) =>
    requestJson<{ message: string }>("PATCH", "/api/profile/password", body),

  /** `POST /profile/deletion-request` — удаление после 30-дневного периода, сессия остаётся. */
  requestDeletion: () => requestJson<{ deletion_request: DeletionRequest }>("POST", "/api/profile/deletion-request"),

  /** `DELETE /profile` — немедленное удаление (204); BFF удаляет cookie сессии. */
  deleteAccount: () => requestJson<null>("DELETE", "/api/profile"),

  /** `POST /verification/submit` — сверка с базой выпускников, результат приходит сразу. */
  submitVerification: (body: { last_name: string; first_name: string; phone: string }) =>
    requestJson<{ verification_request: VerificationRequest }>("POST", "/api/verification/submit", body),
};
