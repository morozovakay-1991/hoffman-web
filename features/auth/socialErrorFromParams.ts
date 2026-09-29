import { socialErrorText } from "./messages";
import { isSocialProvider } from "./types";

type SearchParams = Record<string, string | string[] | undefined>;

/** Текст ошибки входа через Apple/Google из `?social_error=CODE&provider=...` (redirect из callback). */
export function socialErrorFromParams(params: SearchParams): string | undefined {
  const code = params.social_error;
  const provider = params.provider;
  if (typeof code !== "string" || typeof provider !== "string" || !isSocialProvider(provider)) return;
  return socialErrorText(code, provider);
}
