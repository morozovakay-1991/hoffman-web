import "server-only";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

// Sanctum-токен Laravel живёт только в httpOnly cookie: JS в браузере его не
// видит, а Route Handlers / Server Components читают его и подставляют
// `Authorization: Bearer` в запросы к Laravel (docs/plan.md, Этап 26).

export const SESSION_COOKIE = "hoffman_session";

// Токены Sanctum на backend бессрочные (`sanctum.expiration = null`), поэтому
// срок жизни сессии на сайте задаёт cookie.
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function getSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value || undefined;
}
