import { describe, expect, it } from "vitest";
import { AuthErrorText } from "./messages";
import {
  validateCode,
  validateEmail,
  validateNewPassword,
  validatePasswordConfirmation,
} from "./validation";

describe("validation", () => {
  it("проверяет email", () => {
    expect(validateEmail("")).toBe(AuthErrorText.emailRequired);
    expect(validateEmail("user@")).toBe(AuthErrorText.emailInvalid);
    expect(validateEmail(" user@example.com ")).toBeUndefined();
  });

  it("требует от пароля 8+ символов, цифру и спецсимвол, как RegisterRequest::PASSWORD_REGEX", () => {
    expect(validateNewPassword("")).toBe(AuthErrorText.passwordRequired);
    expect(validateNewPassword("abc1!")).toBe(AuthErrorText.passwordFormat);
    expect(validateNewPassword("abcdefgh!")).toBe(AuthErrorText.passwordFormat);
    expect(validateNewPassword("abcdefg12")).toBe(AuthErrorText.passwordFormat);
    expect(validateNewPassword("abcdef1!")).toBeUndefined();
  });

  it("сравнивает пароли", () => {
    expect(validatePasswordConfirmation("abcdef1!", "abcdef1?")).toBe(AuthErrorText.passwordsMismatch);
    expect(validatePasswordConfirmation("abcdef1!", "")).toBe(AuthErrorText.passwordsMismatch);
    expect(validatePasswordConfirmation("abcdef1!", "abcdef1!")).toBeUndefined();
  });

  it("принимает только 6 цифр кода", () => {
    expect(validateCode("12345")).toBe(AuthErrorText.codeIncomplete);
    expect(validateCode("123456")).toBeUndefined();
  });
});
