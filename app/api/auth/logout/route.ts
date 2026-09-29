import { NextResponse, type NextRequest } from "next/server";
import { laravelFetch } from "@/lib/server/laravel";
import { clearSessionCookie, getSessionToken } from "@/lib/server/session";

export async function POST(request: NextRequest) {
  const token = await getSessionToken();
  // Отзываем токен в Laravel по возможности; cookie удаляем в любом случае.
  if (token) await laravelFetch("/auth/logout", { method: "POST", token });

  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  clearSessionCookie(response);
  return response;
}
