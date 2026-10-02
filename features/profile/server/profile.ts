import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { laravelFetch, readJson } from "@/lib/server/laravel";
import { getSessionToken } from "@/lib/server/session";
import type { Profile, VerificationRequest } from "../types";

/**
 * GET-запрос к Laravel от имени текущего пользователя для Server Components.
 * Без сессии — на вход; отозванный токен или блокировка — через session-expired,
 * который удалит cookie (Server Components менять cookie не могут).
 */
async function sessionGet<T>(path: string): Promise<T> {
  const token = await getSessionToken();
  if (!token) redirect("/login");

  const response = await laravelFetch(path, { token });
  if (!response) throw new Error("Hoffman API is unavailable");
  if (response.status === 401 || response.status === 403) redirect("/api/auth/session-expired");
  if (!response.ok) throw new Error(`GET ${path} failed with ${response.status}`);

  return (await readJson(response)) as T;
}

/**
 * `GET /profile`: имя, email и `graduate_status` — по нему backend открывает доступ
 * выпускника. `cache` — один запрос на рендер, хотя профиль читают и layout, и страница.
 */
export const requireProfile = cache(async (): Promise<Profile> => {
  return (await sessionGet<{ profile: Profile }>("/profile")).profile;
});

/** `GET /verification/status`: последняя заявка (для предзаполнения формы), `null` — заявок не было. */
export async function getVerificationRequest(): Promise<VerificationRequest | null> {
  return (await sessionGet<{ verification_request: VerificationRequest | null }>("/verification/status"))
    .verification_request;
}
