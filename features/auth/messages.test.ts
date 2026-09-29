import { describe, expect, it } from "vitest";
import { socialErrorText, tooManyAttemptsWait } from "./messages";
import { socialErrorFromParams } from "./socialErrorFromParams";

describe("тексты ошибок", () => {
  it("склоняет минуты", () => {
    expect(tooManyAttemptsWait(30)).toBe("Слишком много попыток. Попробуйте через 1 минуту");
    expect(tooManyAttemptsWait(180)).toBe("Слишком много попыток. Попробуйте через 3 минуты");
    expect(tooManyAttemptsWait(660)).toBe("Слишком много попыток. Попробуйте через 11 минут");
  });

  it("описывает ошибки входа через Apple / Google", () => {
    expect(socialErrorText("INVALID_PROVIDER_TOKEN", "apple")).toBe("Не удалось войти через Apple ID. Попробуйте снова");
    expect(socialErrorText("SOCIAL_EMAIL_CONFLICT", "google")).toBe(
      "Этот email уже зарегистрирован. Войдите по email и паролю",
    );
    expect(socialErrorText("PROVIDER_UNAVAILABLE", "google")).toBe("Вход через Google временно недоступен");
  });

  it("игнорирует неизвестного провайдера в query", () => {
    expect(socialErrorFromParams({ social_error: "X", provider: "facebook" })).toBeUndefined();
    expect(socialErrorFromParams({ social_error: "ACCOUNT_BLOCKED", provider: "apple" })).toBe("Аккаунт заблокирован");
  });
});
