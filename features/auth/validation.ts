import { AuthErrorText } from "./messages";

// Клиентские проверки повторяют правила запросов hoffman-backend, чтобы
// большинство ошибок показывалось без запроса к серверу.

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Спецсимволы из `RegisterRequest::PASSWORD_REGEX`. */
const SPECIAL = /[!@#$%^&*(),.?":{}|<>]/;

export const PASSWORD_RULES = [
  { id: "length", label: "Не менее 8 символов", test: (v: string) => v.length >= 8 },
  { id: "digit", label: "Хотя бы одна цифра", test: (v: string) => /[0-9]/.test(v) },
  {
    id: "special",
    label: 'Хотя бы один спецсимвол: !@#$%^&*(),.?":{}|<>',
    test: (v: string) => SPECIAL.test(v),
  },
] as const;

export function validateEmail(value: string): string | undefined {
  const email = value.trim();
  if (!email) return AuthErrorText.emailRequired;
  if (!EMAIL.test(email)) return AuthErrorText.emailInvalid;
}

export function validateRequiredPassword(value: string): string | undefined {
  if (!value) return AuthErrorText.passwordRequired;
}

export function validateNewPassword(value: string): string | undefined {
  if (!value) return AuthErrorText.passwordRequired;
  if (!PASSWORD_RULES.every((rule) => rule.test(value))) return AuthErrorText.passwordFormat;
}

export function validatePasswordConfirmation(password: string, confirmation: string): string | undefined {
  if (!confirmation || confirmation !== password) return AuthErrorText.passwordsMismatch;
}

export function validateName(value: string): string | undefined {
  if (!value.trim()) return AuthErrorText.nameRequired;
}

export function validateCode(value: string): string | undefined {
  if (!/^\d{6}$/.test(value)) return AuthErrorText.codeIncomplete;
}

export function validateConsents(consents: { privacy: boolean; personalData: boolean }): string | undefined {
  if (!consents.privacy || !consents.personalData) return AuthErrorText.consentRequired;
}
