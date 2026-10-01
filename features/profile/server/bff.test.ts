// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { apiError, jsonResponse, mockFetch, requestBody } from "@/features/auth/test/utils";
import { forwardSessionRequest } from "./bff";

const cookieStore = { value: undefined as string | undefined };
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (name === "hoffman_session" && cookieStore.value ? { value: cookieStore.value } : undefined),
  }),
}));

function request(method: string, body: unknown = {}, contentType = "application/json") {
  return new NextRequest("http://localhost:3000/api/profile", {
    method,
    headers: { "Content-Type": contentType },
    body: JSON.stringify(body),
  });
}

describe("forwardSessionRequest", () => {
  beforeEach(() => {
    vi.stubEnv("HOFFMAN_API_URL", "http://laravel.test");
    cookieStore.value = "7|secret";
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("подставляет Bearer-токен из cookie и возвращает ответ Laravel без токена", async () => {
    const fetchMock = mockFetch(jsonResponse(200, { profile: { id: 1, name: "Anna" } }));

    const response = await forwardSessionRequest(request("PATCH", { name: "Anna" }), "/profile", { method: "PATCH" });

    expect(fetchMock.mock.calls[0][0]).toBe("http://laravel.test/api/v1/profile");
    const init = fetchMock.mock.calls[0][1]!;
    expect(init.method).toBe("PATCH");
    expect(init.headers).toMatchObject({ Authorization: "Bearer 7|secret" });
    expect(requestBody(fetchMock)).toEqual({ name: "Anna" });
    expect(response.status).toBe(200);
    expect(JSON.stringify(await response.json())).not.toContain("secret");
  });

  it("без сессии отвечает 401 и не ходит в Laravel", async () => {
    cookieStore.value = undefined;
    const fetchMock = mockFetch();
    const response = await forwardSessionRequest(request("PATCH"), "/profile", { method: "PATCH" });
    expect(response.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("отклоняет не-JSON запрос (защита от CSRF через HTML-форму)", async () => {
    const fetchMock = mockFetch();
    const response = await forwardSessionRequest(request("POST", {}, "application/x-www-form-urlencoded"), "/profile/deletion-request", {
      method: "POST",
    });
    expect(response.status).toBe(415);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("пробрасывает ошибку Laravel и Retry-After", async () => {
    mockFetch(apiError(429, "TOO_MANY_REQUESTS", {}, { "Retry-After": "30" }));
    const response = await forwardSessionRequest(request("PATCH"), "/profile/email", { method: "PATCH" });
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("30");
    expect((await response.json()).error.code).toBe("TOO_MANY_REQUESTS");
  });

  it("удаляет cookie, если Laravel отозвал токен", async () => {
    mockFetch(apiError(401, "UNAUTHENTICATED"));
    const response = await forwardSessionRequest(request("PATCH"), "/profile", { method: "PATCH" });
    expect(response.status).toBe(401);
    expect(response.headers.get("set-cookie")).toMatch(/hoffman_session=;.*Max-Age=0/i);
  });

  it("DELETE /profile: без тела, 204 и cookie сессии удалена", async () => {
    const fetchMock = mockFetch(new Response(null, { status: 204 }));
    const response = await forwardSessionRequest(request("DELETE"), "/profile", { method: "DELETE", endsSession: true });

    expect(fetchMock.mock.calls[0][1]?.method).toBe("DELETE");
    expect(fetchMock.mock.calls[0][1]?.body).toBeUndefined();
    expect(response.status).toBe(204);
    expect(response.headers.get("set-cookie")).toMatch(/hoffman_session=;.*Max-Age=0/i);
  });

  it("не удаляет cookie, если удаление не удалось", async () => {
    mockFetch(apiError(500, "SERVER_ERROR"));
    const response = await forwardSessionRequest(request("DELETE"), "/profile", { method: "DELETE", endsSession: true });
    expect(response.status).toBe(500);
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("backend недоступен — 502 BACKEND_UNAVAILABLE", async () => {
    mockFetch(new Error("ECONNREFUSED"));
    const response = await forwardSessionRequest(request("POST", { code: "123456" }), "/profile/email/confirm", { method: "POST" });
    expect(response.status).toBe(502);
    expect((await response.json()).error.code).toBe("BACKEND_UNAVAILABLE");
  });
});
