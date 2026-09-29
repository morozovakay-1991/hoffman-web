import type { ApiError, AuthUser } from "./types";

// Браузер ходит только в собственные Route Handlers Next.js (`/api/auth/*`),
// токен Laravel ему недоступен — он лежит в httpOnly cookie.

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };

export async function postJson<T>(url: string, body: unknown): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      credentials: "same-origin",
    });
  } catch {
    return { ok: false, error: { status: 0, code: "NETWORK", fields: {} } };
  }

  const data = await response.json().catch(() => null);
  if (response.ok) return { ok: true, data: data as T };

  const error = data?.error ?? {};
  const retryAfter = Number(response.headers.get("retry-after"));
  return {
    ok: false,
    error: {
      status: response.status,
      code: typeof error.code === "string" ? error.code : "UNKNOWN",
      fields: error.fields && typeof error.fields === "object" ? error.fields : {},
      retryAfter: Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : undefined,
    },
  };
}

export const authApi = {
  login: (body: { email: string; password: string }) =>
    postJson<{ user: AuthUser }>("/api/auth/login", body),

  register: (body: { name: string; email: string; password: string; password_confirmation: string }) =>
    postJson<{ user: AuthUser }>("/api/auth/register", body),

  /** Backend отвечает 200 даже для незарегистрированного email (защита от перебора). */
  forgotPassword: (body: { email: string }) => postJson<unknown>("/api/auth/password/forgot", body),

  verifyResetCode: (body: { email: string; code: string }) =>
    postJson<unknown>("/api/auth/password/verify-code", body),

  resetPassword: (body: { email: string; code: string; password: string; password_confirmation: string }) =>
    postJson<unknown>("/api/auth/password/reset", body),
};

/** `VALIDATION_ERROR` с ошибкой `unique` на email — старый формат до кода `EMAIL_TAKEN`. */
export function isEmailTaken(error: ApiError): boolean {
  return (
    error.code === "EMAIL_TAKEN" ||
    (error.fields.email?.some((message) => message.includes("already been taken")) ?? false)
  );
}
