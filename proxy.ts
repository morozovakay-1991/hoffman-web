import { NextResponse, type NextRequest } from "next/server";

// Оптимистичная проверка по наличию cookie сессии (без запроса к Laravel):
// настоящая проверка токена — в requireUser() на странице.
// Имя cookie дублирует SESSION_COOKIE из lib/server/session.ts: тот модуль
// server-only и тянет next/headers.
const SESSION_COOKIE = "hoffman_session";

const GUEST_ONLY = ["/login", "/register", "/forgot-password"];

export function proxy(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard") && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (GUEST_ONLY.includes(pathname) && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/forgot-password"],
};
