// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { callbackParams, completeSocialLogin, startSocialLogin } from "./social";
import { apiError, jsonResponse, mockFetch, requestBody } from "../test/utils";

const ORIGIN = "https://hoffman.test";

function fakeIdToken(claims: Record<string, unknown>): string {
  const part = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${part({ alg: "RS256" })}.${part(claims)}.signature`;
}

function oauthCookie(response: Response): { value: Record<string, string>; raw: string } {
  const raw = response.headers.get("set-cookie") ?? "";
  const match = raw.match(/hoffman_oauth=([^;]+)/);
  return { value: JSON.parse(decodeURIComponent(match![1])), raw };
}

function start(provider: "apple" | "google", from = "login") {
  return startSocialLogin(new NextRequest(`${ORIGIN}/api/auth/${provider}/start?from=${from}`), provider);
}

function callbackRequest(provider: "apple" | "google", cookie: string, init: { query?: string; form?: Record<string, string> }) {
  if (init.form) {
    return new NextRequest(`${ORIGIN}/api/auth/${provider}/callback`, {
      method: "POST",
      headers: { Cookie: `hoffman_oauth=${encodeURIComponent(cookie)}` },
      body: new URLSearchParams(init.form),
    });
  }
  return new NextRequest(`${ORIGIN}/api/auth/${provider}/callback?${init.query ?? ""}`, {
    headers: { Cookie: `hoffman_oauth=${encodeURIComponent(cookie)}` },
  });
}

async function callback(provider: "apple" | "google", request: NextRequest) {
  return completeSocialLogin(request, provider, await callbackParams(request));
}

describe("вход через Apple / Google", () => {
  beforeEach(() => {
    vi.stubEnv("APP_URL", ORIGIN);
    vi.stubEnv("HOFFMAN_API_URL", "http://laravel.test");
    vi.stubEnv("GOOGLE_WEB_CLIENT_ID", "google-web-client");
    vi.stubEnv("GOOGLE_WEB_CLIENT_SECRET", "google-secret");
    vi.stubEnv("APPLE_SERVICES_ID", "com.hoffman.web");
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("без настроек провайдера возвращает на форму с явной ошибкой, а не молча", () => {
    vi.stubEnv("APPLE_SERVICES_ID", "");
    const response = start("apple", "register");
    const location = new URL(response.headers.get("location")!);
    expect(location.pathname).toBe("/register");
    expect(location.searchParams.get("social_error")).toBe("PROVIDER_UNAVAILABLE");
    expect(location.searchParams.get("provider")).toBe("apple");
  });

  it("Google: редирект на авторизацию с state, nonce и PKCE", () => {
    const response = start("google");
    const location = new URL(response.headers.get("location")!);
    const { value, raw } = oauthCookie(response);

    expect(location.origin + location.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
    expect(location.searchParams.get("client_id")).toBe("google-web-client");
    expect(location.searchParams.get("redirect_uri")).toBe(`${ORIGIN}/api/auth/google/callback`);
    expect(location.searchParams.get("state")).toBe(value.state);
    expect(location.searchParams.get("nonce")).toBe(value.nonce);
    expect(location.searchParams.get("code_challenge_method")).toBe("S256");
    expect(raw).toMatch(/HttpOnly/i);
  });

  it("Apple: form_post и cookie состояния с SameSite=None (callback — кросс-сайтовый POST)", () => {
    const response = start("apple");
    const location = new URL(response.headers.get("location")!);
    expect(location.origin).toBe("https://appleid.apple.com");
    expect(location.searchParams.get("response_mode")).toBe("form_post");
    expect(location.searchParams.get("client_id")).toBe("com.hoffman.web");
    expect(oauthCookie(response).raw).toMatch(/SameSite=none/i);
    expect(oauthCookie(response).raw).toMatch(/Secure/i);
  });

  it("Google callback: обменивает code на id_token, отдаёт его в POST /auth/google и ставит сессию", async () => {
    const { value } = oauthCookie(start("google"));
    const idToken = fakeIdToken({ nonce: value.nonce, sub: "1" });
    const fetchMock = mockFetch(
      jsonResponse(200, { id_token: idToken }),
      jsonResponse(200, { user: { id: 1 }, token: "5|laravel" }),
    );

    const response = await callback(
      "google",
      callbackRequest("google", JSON.stringify(value), { query: `code=abc&state=${value.state}` }),
    );

    expect(fetchMock.mock.calls[0][0]).toBe("https://oauth2.googleapis.com/token");
    const tokenRequest = fetchMock.mock.calls[0][1]!;
    expect(String(tokenRequest.body)).toContain(`code_verifier=${value.verifier}`);
    expect(fetchMock.mock.calls[1][0]).toBe("http://laravel.test/api/v1/auth/google");
    expect(requestBody(fetchMock, 1)).toEqual({ token: idToken });

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(`${ORIGIN}/dashboard`);
    expect(response.headers.get("set-cookie")).toContain("hoffman_session=5%7Claravel");
  });

  it("Apple callback: берёт id_token из form_post", async () => {
    const { value } = oauthCookie(start("apple"));
    const idToken = fakeIdToken({ nonce: value.nonce });
    const fetchMock = mockFetch(jsonResponse(200, { user: { id: 1 }, token: "6|laravel" }));

    const response = await callback(
      "apple",
      callbackRequest("apple", JSON.stringify(value), { form: { state: value.state, code: "c", id_token: idToken } }),
    );

    expect(fetchMock.mock.calls[0][0]).toBe("http://laravel.test/api/v1/auth/apple");
    expect(requestBody(fetchMock)).toEqual({ token: idToken });
    expect(response.headers.get("location")).toBe(`${ORIGIN}/dashboard`);
  });

  it("отклоняет callback с чужим state", async () => {
    const { value } = oauthCookie(start("google"));
    const fetchMock = mockFetch();
    const response = await callback("google", callbackRequest("google", JSON.stringify(value), { query: "code=abc&state=forged" }));

    expect(new URL(response.headers.get("location")!).searchParams.get("social_error")).toBe("INVALID_STATE");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("отклоняет id_token с чужим nonce", async () => {
    const { value } = oauthCookie(start("apple"));
    const fetchMock = mockFetch();
    const response = await callback(
      "apple",
      callbackRequest("apple", JSON.stringify(value), {
        form: { state: value.state, id_token: fakeIdToken({ nonce: "other" }) },
      }),
    );
    expect(new URL(response.headers.get("location")!).searchParams.get("social_error")).toBe("INVALID_STATE");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("отмена у провайдера возвращает на форму без ошибки", async () => {
    const { value } = oauthCookie(start("google", "register"));
    const response = await callback(
      "google",
      callbackRequest("google", JSON.stringify(value), { query: `error=access_denied&state=${value.state}` }),
    );
    const location = new URL(response.headers.get("location")!);
    expect(location.pathname).toBe("/register");
    expect(location.searchParams.has("social_error")).toBe(false);
  });

  it.each(["INVALID_PROVIDER_TOKEN", "SOCIAL_EMAIL_CONFLICT", "ACCOUNT_BLOCKED"])(
    "передаёт код ошибки Laravel %s на форму",
    async (code) => {
      const { value } = oauthCookie(start("apple"));
      mockFetch(apiError(code === "SOCIAL_EMAIL_CONFLICT" ? 409 : 401, code));
      const response = await callback(
        "apple",
        callbackRequest("apple", JSON.stringify(value), {
          form: { state: value.state, id_token: fakeIdToken({ nonce: value.nonce }) },
        }),
      );
      const location = new URL(response.headers.get("location")!);
      expect(location.pathname).toBe("/login");
      expect(location.searchParams.get("social_error")).toBe(code);
      expect(response.headers.get("set-cookie")).not.toContain("hoffman_session");
    },
  );
});
