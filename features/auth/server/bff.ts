import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { clientIpOf, laravelFetch, readJson } from "@/lib/server/laravel";
import { setSessionCookie } from "@/lib/server/session";

type ForwardOptions = {
  /** Эндпоинт выдаёт Sanctum-токен (`login`, `register`): кладём его в cookie и не отдаём клиенту. */
  issuesToken?: boolean;
};

export function errorResponse(status: number, code: string): NextResponse {
  return NextResponse.json({ error: { code, message: code, fields: {} } }, { status });
}

/**
 * Проксирует JSON-запрос браузера в Laravel `/api/v1{path}` и возвращает ответ
 * Laravel как есть (статус, тело ошибки, `Retry-After`) — кроме токена.
 */
export async function forwardAuthRequest(
  request: NextRequest,
  path: string,
  { issuesToken = false }: ForwardOptions = {},
): Promise<NextResponse> {
  // Только application/json: HTML-форма с чужого сайта не может отправить такой
  // запрос без CORS-preflight, это закрывает login CSRF.
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return errorResponse(415, "UNSUPPORTED_MEDIA_TYPE");
  }

  const body = await readJson(request);
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return errorResponse(400, "BAD_REQUEST");
  }

  const response = await laravelFetch(path, {
    method: "POST",
    body,
    clientIp: clientIpOf(request.headers),
  });
  if (!response) return errorResponse(502, "BACKEND_UNAVAILABLE");

  const data = (await readJson(response)) as Record<string, unknown> | null;

  if (!response.ok) {
    const headers = new Headers();
    const retryAfter = response.headers.get("retry-after");
    if (retryAfter) headers.set("Retry-After", retryAfter);
    return NextResponse.json(data ?? { error: { code: "UNKNOWN", fields: {} } }, {
      status: response.status,
      headers,
    });
  }

  if (!issuesToken) return NextResponse.json(data ?? {}, { status: response.status });

  const token = data?.token;
  if (typeof token !== "string" || !token) return errorResponse(502, "UNKNOWN");

  const result = NextResponse.json({ user: data?.user }, { status: response.status });
  setSessionCookie(result, token);
  return result;
}
