// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { forwardAuthRequest } from "./bff";
import { apiError, jsonResponse, mockFetch, requestBody } from "../test/utils";

function jsonRequest(body: unknown, contentType = "application/json") {
  return new NextRequest("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": contentType, "X-Forwarded-For": "203.0.113.7, 10.0.0.1" },
    body: JSON.stringify(body),
  });
}

describe("forwardAuthRequest", () => {
  beforeEach(() => vi.stubEnv("HOFFMAN_API_URL", "http://laravel.test/"));
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("кладёт токен Laravel в httpOnly cookie и не отдаёт его клиенту", async () => {
    const fetchMock = mockFetch(jsonResponse(200, { user: { id: 1, name: "Anna" }, token: "1|secret" }));

    const response = await forwardAuthRequest(jsonRequest({ email: "a@b.co", password: "x" }), "/auth/login", {
      issuesToken: true,
    });

    expect(fetchMock.mock.calls[0][0]).toBe("http://laravel.test/api/v1/auth/login");
    const init = fetchMock.mock.calls[0][1]!;
    expect(init.headers).toMatchObject({ Accept: "application/json", "X-Forwarded-For": "203.0.113.7" });
    expect(requestBody(fetchMock)).toEqual({ email: "a@b.co", password: "x" });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ user: { id: 1, name: "Anna" } });
    const cookie = response.headers.get("set-cookie") ?? "";
    expect(cookie).toContain("hoffman_session=1%7Csecret");
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=lax/i);
  });

  it("пробрасывает ошибку Laravel и Retry-After без изменений", async () => {
    mockFetch(apiError(429, "TOO_MANY_REQUESTS", {}, { "Retry-After": "42" }));
    const response = await forwardAuthRequest(jsonRequest({}), "/auth/login", { issuesToken: true });

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("42");
    expect((await response.json()).error.code).toBe("TOO_MANY_REQUESTS");
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("не ставит cookie для эндпоинтов без токена", async () => {
    mockFetch(jsonResponse(200, { message: "sent" }));
    const response = await forwardAuthRequest(jsonRequest({ email: "a@b.co" }), "/auth/password/forgot");
    expect(await response.json()).toEqual({ message: "sent" });
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("отклоняет не-JSON запросы (защита от login CSRF через HTML-форму)", async () => {
    const fetchMock = mockFetch();
    const response = await forwardAuthRequest(jsonRequest({}, "text/plain"), "/auth/login", { issuesToken: true });
    expect(response.status).toBe(415);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("возвращает 502 BACKEND_UNAVAILABLE, если Laravel недоступен", async () => {
    mockFetch(new TypeError("fetch failed"));
    const response = await forwardAuthRequest(jsonRequest({}), "/auth/login", { issuesToken: true });
    expect(response.status).toBe(502);
    expect((await response.json()).error.code).toBe("BACKEND_UNAVAILABLE");
  });
});
