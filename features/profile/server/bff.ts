import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { errorResponse } from "@/features/auth/server/bff";
import { clientIpOf, laravelFetch, readJson } from "@/lib/server/laravel";
import { clearSessionCookie, getSessionToken } from "@/lib/server/session";

type SessionRequestOptions = {
  method: "POST" | "PATCH" | "DELETE";
  /** Успешный ответ завершает сессию (`DELETE /profile` отзывает все токены): удаляем cookie. */
  endsSession?: boolean;
};

/**
 * Проксирует запрос браузера в Laravel `/api/v1{path}` от имени текущего
 * пользователя: Bearer-токен берётся из httpOnly cookie и клиенту не отдаётся.
 * Ответ Laravel (статус, `{error: {code, message, fields}}`, `Retry-After`)
 * возвращается как есть.
 */
export async function forwardSessionRequest(
  request: NextRequest,
  path: string,
  { method, endsSession = false }: SessionRequestOptions,
): Promise<NextResponse> {
  // Только application/json: такой запрос с чужого сайта требует CORS-preflight,
  // поэтому HTML-форма или <img> не могут выполнить действие от имени пользователя.
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return errorResponse(415, "UNSUPPORTED_MEDIA_TYPE");
  }

  const token = await getSessionToken();
  if (!token) return errorResponse(401, "UNAUTHENTICATED");

  const body = await readJson(request);
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return errorResponse(400, "BAD_REQUEST");
  }

  const response = await laravelFetch(path, {
    method,
    body: method === "DELETE" ? undefined : body,
    token,
    clientIp: clientIpOf(request.headers),
  });
  if (!response) return errorResponse(502, "BACKEND_UNAVAILABLE");

  if (!response.ok) {
    const headers = new Headers();
    const retryAfter = response.headers.get("retry-after");
    if (retryAfter) headers.set("Retry-After", retryAfter);
    const data = await readJson(response);
    const result = NextResponse.json(data ?? { error: { code: "UNKNOWN", fields: {} } }, {
      status: response.status,
      headers,
    });
    // Токен отозван (выход на другом устройстве, удалённый аккаунт) — сессия на сайте тоже закончилась.
    if (response.status === 401) clearSessionCookie(result);
    return result;
  }

  const result =
    response.status === 204
      ? new NextResponse(null, { status: 204 })
      : NextResponse.json((await readJson(response)) ?? {}, { status: response.status });
  if (endsSession) clearSessionCookie(result);
  return result;
}
