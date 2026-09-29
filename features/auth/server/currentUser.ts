import "server-only";
import { redirect } from "next/navigation";
import { laravelFetch, readJson } from "@/lib/server/laravel";
import { getSessionToken } from "@/lib/server/session";
import type { AuthUser } from "../types";

/**
 * Текущий пользователь для Server Components: токен из httpOnly cookie
 * подставляется в `GET /auth/me` на сервере. Без сессии — редирект на вход.
 */
export async function requireUser(): Promise<AuthUser> {
  const token = await getSessionToken();
  if (!token) redirect("/login");

  const response = await laravelFetch("/auth/me", { token });
  if (!response) throw new Error("Hoffman API is unavailable");
  // Токен отозван (logout на другом устройстве) или аккаунт заблокирован.
  if (response.status === 401 || response.status === 403) redirect("/api/auth/session-expired");
  if (!response.ok) throw new Error(`GET /auth/me failed with ${response.status}`);

  const data = (await readJson(response)) as { user: AuthUser };
  return data.user;
}
