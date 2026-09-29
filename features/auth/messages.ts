import type { ApiError, SocialProvider } from "./types";

// Тексты ошибок — те же, что в мобильном приложении (Figma, секция «Ошибки»;
// hoffman-mobile/lib/features/auth/presentation/auth_validators.dart).
export const AuthErrorText = {
  emailRequired: "Заполните email",
  passwordRequired: "Заполните пароль",
  nameRequired: "Заполните имя",
  emailInvalid: "Неверный формат email",
  emailTaken: "Email уже используется",
  emailNotFound: "Email не зарегистрирован",
  passwordFormat: "Минимум 8 символов, включая цифры и спецсимволы",
  passwordsMismatch: "Пароли не совпадают",
  consentRequired: "Примите условия чтобы продолжить",
  invalidCredentials: "Неверный email или пароль",
  codeIncomplete: "Введите все 6 цифр кода",
  invalidCode: "Неверный код. Попробуйте снова",
  codeExpired: "Код устарел. Запросите новый",
  tooManyAttemptsNewCode: "Слишком много попыток. Запросите новый код",
  accountBlocked: "Аккаунт заблокирован",
  network: "Нет соединения. Проверьте подключение и попробуйте снова",
  unknown: "Что-то пошло не так. Попробуйте позже",
} as const;

export function tooManyAttemptsWait(seconds: number): string {
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  return `Слишком много попыток. Попробуйте через ${minutes} ${minutesWord(minutes)}`;
}

function minutesWord(n: number): string {
  const mod100 = n % 100;
  const mod10 = n % 10;
  if (mod100 >= 11 && mod100 <= 14) return "минут";
  if (mod10 === 1) return "минуту";
  if (mod10 >= 2 && mod10 <= 4) return "минуты";
  return "минут";
}

/** Текст для ошибок, общих для всех форм (429, блокировка, сеть, 5xx). */
export function commonErrorText(error: ApiError): string {
  if (error.status === 429) return tooManyAttemptsWait(error.retryAfter ?? 60);
  if (error.code === "ACCOUNT_BLOCKED") return AuthErrorText.accountBlocked;
  if (error.code === "NETWORK") return AuthErrorText.network;
  return AuthErrorText.unknown;
}

export const PROVIDER_NAMES: Record<SocialProvider, string> = {
  apple: "Apple ID",
  google: "Google",
};

/** Ошибка входа через Apple/Google — код из `?social_error=` после callback. */
export function socialErrorText(code: string, provider: SocialProvider): string {
  const name = PROVIDER_NAMES[provider];
  switch (code) {
    case "SOCIAL_EMAIL_CONFLICT":
      return "Этот email уже зарегистрирован. Войдите по email и паролю";
    case "ACCOUNT_BLOCKED":
      return AuthErrorText.accountBlocked;
    case "PROVIDER_UNAVAILABLE":
      return `Вход через ${name} временно недоступен`;
    case "TOO_MANY_REQUESTS":
      return tooManyAttemptsWait(60);
    default:
      // INVALID_PROVIDER_TOKEN, INVALID_STATE, PROVIDER_ERROR, BACKEND_UNAVAILABLE, ...
      return `Не удалось войти через ${name}. Попробуйте снова`;
  }
}
