/** `UserResource` из hoffman-backend. */
export type AuthUser = {
  id: number;
  name: string;
  email: string | null;
  created_at: string;
};

/**
 * Ошибка запроса к BFF. `code` — код из тела Laravel `{error: {code, message, fields}}`
 * (`INVALID_CREDENTIALS`, `EMAIL_TAKEN`, `INVALID_CODE`, ...), либо собственный:
 * `NETWORK` (браузер не достучался до Next.js), `BACKEND_UNAVAILABLE` (Next.js не
 * достучался до Laravel), `UNKNOWN`.
 */
export type ApiError = {
  status: number;
  code: string;
  fields: Record<string, string[]>;
  /** Секунды из заголовка `Retry-After` ответа 429. */
  retryAfter?: number;
};

export type SocialProvider = "apple" | "google";

export const SOCIAL_PROVIDERS: readonly SocialProvider[] = ["apple", "google"];

export function isSocialProvider(value: string): value is SocialProvider {
  return (SOCIAL_PROVIDERS as readonly string[]).includes(value);
}
