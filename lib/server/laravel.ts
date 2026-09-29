import "server-only";

// Клиент Laravel API для BFF-прокси (см. docs/plan.md). Вызывается только на
// сервере Next.js: браузер обращается к нашим Route Handlers, а не к Laravel.

const DEFAULT_API_URL = "http://127.0.0.1:8000";

export function apiUrl(path: string): string {
  const base = (process.env.HOFFMAN_API_URL ?? DEFAULT_API_URL).replace(/\/+$/, "");
  return `${base}/api/v1${path}`;
}

type LaravelRequest = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
  /** IP посетителя — чтобы rate limit Laravel считал попытки по клиенту, а не по серверу Next.js. */
  clientIp?: string | null;
};

/**
 * Запрос к Laravel. Возвращает `null`, если backend недоступен (сеть, таймаут),
 * чтобы вызывающий код отличал это от ошибочного HTTP-ответа.
 */
export async function laravelFetch(
  path: string,
  { method = "GET", body, token, clientIp }: LaravelRequest = {},
): Promise<Response | null> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  if (clientIp) headers["X-Forwarded-For"] = clientIp;

  try {
    return await fetch(apiUrl(path), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return null;
  }
}

export async function readJson(message: Request | Response): Promise<unknown> {
  try {
    return await message.json();
  } catch {
    return null;
  }
}

export function clientIpOf(headers: Headers): string | null {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip");
}
