import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { clientIpOf, laravelFetch, readJson } from "@/lib/server/laravel";
import { setSessionCookie } from "@/lib/server/session";
import type { SocialProvider } from "@/features/auth/types";

// Вход через Apple / Google на сайте — redirect-флоу OAuth 2.0 / OpenID Connect,
// который проходит сервер Next.js (BFF):
//
//   1. GET  /api/auth/{provider}/start    — редирект к провайдеру (state, nonce, PKCE).
//   2. GET|POST /api/auth/{provider}/callback — провайдер возвращает code / id_token.
//   3. Next.js получает id_token и отдаёт его в тот же эндпоинт, что и мобильное
//      приложение: POST /api/v1/auth/{provider} {token}. Токен Laravel → httpOnly cookie.
//
// Backend при этом должен принимать id_token, выпущенный для веб-клиента
// (Google Web client ID, Apple Services ID) — см. docs/plan.md, «Вход через Apple/Google».

const OAUTH_COOKIE = "hoffman_oauth";
const OAUTH_COOKIE_MAX_AGE = 10 * 60;

type OAuthState = {
  provider: SocialProvider;
  state: string;
  nonce: string;
  verifier?: string;
  from: AuthPage;
};

type AuthPage = "/login" | "/register";

type ProviderConfig = {
  clientId: string;
  clientSecret?: string;
};

export function providerConfig(provider: SocialProvider): ProviderConfig | null {
  if (provider === "google") {
    const clientId = process.env.GOOGLE_WEB_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_WEB_CLIENT_SECRET;
    return clientId && clientSecret ? { clientId, clientSecret } : null;
  }
  const clientId = process.env.APPLE_SERVICES_ID;
  return clientId ? { clientId } : null;
}

function appOrigin(request: NextRequest): string {
  return (process.env.APP_URL ?? request.nextUrl.origin).replace(/\/+$/, "");
}

function redirectUri(request: NextRequest, provider: SocialProvider): string {
  return `${appOrigin(request)}/api/auth/${provider}/callback`;
}

function randomToken(): string {
  return randomBytes(32).toString("base64url");
}

function authPageFrom(value: string | null | undefined): AuthPage {
  return value === "register" || value === "/register" ? "/register" : "/login";
}

function backToAuthPage(
  request: NextRequest,
  from: AuthPage,
  provider: SocialProvider,
  errorCode?: string,
): NextResponse {
  const url = new URL(from, appOrigin(request));
  if (errorCode) {
    url.searchParams.set("social_error", errorCode);
    url.searchParams.set("provider", provider);
  }
  // 303: callback Apple приходит POST-запросом, браузер должен перейти по GET.
  const response = NextResponse.redirect(url, 303);
  response.cookies.delete({ name: OAUTH_COOKIE, path: "/api/auth" });
  return response;
}

export function startSocialLogin(request: NextRequest, provider: SocialProvider): NextResponse {
  const from = authPageFrom(request.nextUrl.searchParams.get("from"));
  const config = providerConfig(provider);
  if (!config) return backToAuthPage(request, from, provider, "PROVIDER_UNAVAILABLE");

  const oauth: OAuthState = { provider, state: randomToken(), nonce: randomToken(), from };
  let authorizeUrl: URL;

  if (provider === "google") {
    oauth.verifier = randomToken();
    authorizeUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authorizeUrl.search = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri(request, provider),
      response_type: "code",
      scope: "openid email profile",
      state: oauth.state,
      nonce: oauth.nonce,
      code_challenge: createHash("sha256").update(oauth.verifier).digest("base64url"),
      code_challenge_method: "S256",
      prompt: "select_account",
    }).toString();
  } else {
    // С запросом email Apple требует response_mode=form_post: id_token придёт
    // POST-запросом прямо в callback, обмен code на токен не нужен.
    authorizeUrl = new URL("https://appleid.apple.com/auth/authorize");
    authorizeUrl.search = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri(request, provider),
      response_type: "code id_token",
      response_mode: "form_post",
      scope: "name email",
      state: oauth.state,
      nonce: oauth.nonce,
    }).toString();
  }

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(OAUTH_COOKIE, JSON.stringify(oauth), {
    httpOnly: true,
    // form_post от appleid.apple.com — кросс-сайтовый POST, cookie с SameSite=Lax
    // в нём не придёт.
    sameSite: provider === "apple" ? "none" : "lax",
    secure: provider === "apple" || process.env.NODE_ENV === "production",
    path: "/api/auth",
    maxAge: OAUTH_COOKIE_MAX_AGE,
  });
  return response;
}

function readOAuthState(request: NextRequest): OAuthState | null {
  const raw = request.cookies.get(OAUTH_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OAuthState;
  } catch {
    return null;
  }
}

/** Claims id_token без проверки подписи — подпись, iss и aud проверяет Laravel. */
export function decodeJwtPayload(jwt: string): Record<string, unknown> | null {
  const [, payload] = jwt.split(".");
  if (!payload) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

async function exchangeGoogleCode(
  request: NextRequest,
  code: string,
  verifier: string,
  config: ProviderConfig,
): Promise<string | null> {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret ?? "",
        redirect_uri: redirectUri(request, "google"),
        grant_type: "authorization_code",
        code_verifier: verifier,
      }),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { id_token?: unknown };
    return typeof data.id_token === "string" ? data.id_token : null;
  } catch {
    return null;
  }
}

/** Параметры callback: query (Google) или тело form_post (Apple). */
export async function callbackParams(request: NextRequest): Promise<URLSearchParams> {
  if (request.method !== "POST") return request.nextUrl.searchParams;
  try {
    const form = await request.formData();
    const params = new URLSearchParams();
    form.forEach((value, key) => {
      if (typeof value === "string") params.set(key, value);
    });
    return params;
  } catch {
    return new URLSearchParams();
  }
}

export async function completeSocialLogin(
  request: NextRequest,
  provider: SocialProvider,
  params: URLSearchParams,
): Promise<NextResponse> {
  const oauth = readOAuthState(request);
  const from = oauth?.from ?? "/login";

  if (!oauth || oauth.provider !== provider || params.get("state") !== oauth.state) {
    return backToAuthPage(request, from, provider, "INVALID_STATE");
  }

  const providerError = params.get("error");
  if (providerError) {
    // Пользователь закрыл окно провайдера — это не ошибка, просто возвращаем на форму.
    const cancelled = providerError === "access_denied" || providerError === "user_cancelled_authorize";
    return backToAuthPage(request, from, provider, cancelled ? undefined : "PROVIDER_ERROR");
  }

  const config = providerConfig(provider);
  if (!config) return backToAuthPage(request, from, provider, "PROVIDER_UNAVAILABLE");

  let idToken: string | null = null;
  if (provider === "google") {
    const code = params.get("code");
    if (code && oauth.verifier) idToken = await exchangeGoogleCode(request, code, oauth.verifier, config);
  } else {
    idToken = params.get("id_token");
  }
  if (!idToken) return backToAuthPage(request, from, provider, "PROVIDER_ERROR");

  // Защита от подмены/повтора id_token. Проверять только claim безопасно:
  // подделанный токен Laravel отклонит по подписи.
  if (decodeJwtPayload(idToken)?.nonce !== oauth.nonce) {
    return backToAuthPage(request, from, provider, "INVALID_STATE");
  }

  const response = await laravelFetch(`/auth/${provider}`, {
    method: "POST",
    body: { token: idToken },
    clientIp: clientIpOf(request.headers),
  });
  if (!response) return backToAuthPage(request, from, provider, "BACKEND_UNAVAILABLE");

  const data = (await readJson(response)) as {
    token?: unknown;
    error?: { code?: unknown };
  } | null;

  if (!response.ok || typeof data?.token !== "string") {
    const code = typeof data?.error?.code === "string" ? data.error.code : "UNKNOWN";
    return backToAuthPage(request, from, provider, code);
  }

  const result = NextResponse.redirect(new URL("/dashboard", appOrigin(request)), 303);
  result.cookies.delete({ name: OAUTH_COOKIE, path: "/api/auth" });
  setSessionCookie(result, data.token);
  return result;
}
