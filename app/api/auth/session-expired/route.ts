import { NextResponse, type NextRequest } from "next/server";
import { clearSessionCookie } from "@/lib/server/session";

// Server Components не могут менять cookie, поэтому при отозванном/протухшем
// токене страница редиректит сюда: удаляем cookie и отправляем на вход.
export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  clearSessionCookie(response);
  return response;
}
