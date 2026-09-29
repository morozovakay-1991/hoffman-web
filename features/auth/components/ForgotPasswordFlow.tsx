"use client";

import Link from "next/link";
import { useEffect, useId, useState, type FormEvent } from "react";
import { authApi } from "../api";
import { AuthErrorText, commonErrorText, tooManyAttemptsWait } from "../messages";
import type { ApiError } from "../types";
import {
  validateCode,
  validateEmail,
  validateNewPassword,
  validatePasswordConfirmation,
} from "../validation";
import { CodeInput, emptyCode } from "./CodeInput";
import { AuthHeading, FieldError, FormAlert, PasswordRequirements, SubmitButton, TextField, linkClass } from "./ui";

/** Как в мобильном приложении: повторно запросить код можно через 59 секунд. */
export const RESEND_COOLDOWN_SECONDS = 59;

type Step = "email" | "code" | "password" | "done";

function useCountdown(seconds: number) {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (left <= 0) return;
    const timer = setTimeout(() => setLeft((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [left]);
  return [left, () => setLeft(seconds)] as const;
}

/** Ошибки кода из `verify-code` и `reset` (ТЗ 11.2). */
function codeErrorText(error: ApiError): string | undefined {
  if (error.status === 429 && error.retryAfter) return tooManyAttemptsWait(error.retryAfter);
  switch (error.code) {
    case "INVALID_CODE":
    case "VALIDATION_ERROR":
      return AuthErrorText.invalidCode;
    case "CODE_EXPIRED":
      return AuthErrorText.codeExpired;
    case "TOO_MANY_ATTEMPTS":
      return AuthErrorText.tooManyAttemptsNewCode;
  }
}

/** Сброс пароля: email → код из письма → новый пароль → подтверждение. */
export function ForgotPasswordFlow() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(emptyCode);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [errors, setErrors] = useState<Partial<Record<"email" | "code" | "password" | "confirmation" | "form", string>>>({});
  const [loading, setLoading] = useState(false);
  const [secondsLeft, restartCooldown] = useCountdown(RESEND_COOLDOWN_SECONDS);
  const codeErrorId = useId();

  function goToEmail(emailError?: string) {
    setStep("email");
    setCode(emptyCode());
    setErrors({ email: emailError });
  }

  function goToCode(codeError?: string) {
    setStep("code");
    setCode(emptyCode());
    setErrors({ code: codeError });
  }

  async function requestCode() {
    setLoading(true);
    const result = await authApi.forgotPassword({ email: email.trim() });
    setLoading(false);
    if (result.ok) {
      goToCode();
      restartCooldown();
      return;
    }
    if (result.error.code === "VALIDATION_ERROR" && result.error.fields.email) {
      goToEmail(AuthErrorText.emailInvalid);
    } else {
      setErrors({ form: commonErrorText(result.error) });
    }
  }

  async function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const emailError = validateEmail(email);
    setErrors({ email: emailError });
    if (!emailError) await requestCode();
  }

  async function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const codeError = validateCode(code.join(""));
    setErrors({ code: codeError });
    if (codeError) return;

    setLoading(true);
    const result = await authApi.verifyResetCode({ email: email.trim(), code: code.join("") });
    setLoading(false);
    if (result.ok) {
      setStep("password");
      setErrors({});
      return;
    }
    // `forgot` отвечает 200 и для незарегистрированного email (защита от перебора),
    // поэтому «Email не зарегистрирован» backend сообщает только на этом шаге.
    if (result.error.code === "EMAIL_NOT_FOUND") {
      goToEmail(AuthErrorText.emailNotFound);
      return;
    }
    const text = codeErrorText(result.error);
    setErrors(text ? { code: text } : { form: commonErrorText(result.error) });
  }

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const passwordError = validateNewPassword(password);
    const next = {
      password: passwordError,
      confirmation: passwordError ? undefined : validatePasswordConfirmation(password, confirmation),
    };
    setErrors(next);
    if (next.password || next.confirmation) return;

    setLoading(true);
    const result = await authApi.resetPassword({
      email: email.trim(),
      code: code.join(""),
      password,
      password_confirmation: confirmation,
    });
    setLoading(false);
    if (result.ok) {
      setStep("done");
      return;
    }
    const { error } = result;
    if (error.code === "EMAIL_NOT_FOUND") {
      goToEmail(AuthErrorText.emailNotFound);
    } else if (error.code === "VALIDATION_ERROR" && error.fields.password) {
      setErrors({ password: AuthErrorText.passwordFormat });
    } else if (codeErrorText(error) && error.status !== 429) {
      // Код истёк или сброшен между шагами — возвращаем к вводу кода.
      goToCode(codeErrorText(error));
    } else {
      setErrors({ form: commonErrorText(error) });
    }
  }

  if (step === "email") {
    return (
      <form noValidate onSubmit={submitEmail} className="flex flex-col gap-8">
        <AuthHeading title="Сбросить пароль" subtitle="Мы отправим код для сброса пароля на ваш email" />
        <FormAlert message={errors.form} />
        <TextField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="example@gmail.com"
          autoFocus
          value={email}
          error={errors.email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors({});
          }}
        />
        <SubmitButton loading={loading} ready={Boolean(email)}>
          Отправить код
        </SubmitButton>
        <Link href="/login" className={`self-start ${linkClass}`}>
          Вернуться ко входу
        </Link>
      </form>
    );
  }

  if (step === "code") {
    return (
      <form noValidate onSubmit={submitCode} className="flex flex-col gap-8">
        <AuthHeading title="Введите код" subtitle={`Мы отправили 6-значный код на ${email.trim()}`} />
        <FormAlert message={errors.form} />
        <CodeInput
          value={code}
          onChange={(value) => {
            setCode(value);
            setErrors({});
          }}
          error={errors.code}
          errorId={codeErrorId}
          disabled={loading}
        />
        {errors.code && (
          <div className="-mt-6">
            <FieldError id={codeErrorId}>{errors.code}</FieldError>
          </div>
        )}
        <SubmitButton loading={loading} ready={code.every(Boolean)}>
          Подтвердить
        </SubmitButton>
        <div className="flex flex-col items-start gap-4">
          {secondsLeft > 0 ? (
            <p className="text-[13px] leading-[18px] text-hoffman-soft-black" aria-live="polite">
              Отправить еще раз через {secondsLeft}с
            </p>
          ) : (
            <button type="button" disabled={loading} onClick={requestCode} className={linkClass}>
              Отправить еще раз
            </button>
          )}
          <button type="button" onClick={() => goToEmail()} className={linkClass}>
            Изменить email
          </button>
        </div>
      </form>
    );
  }

  if (step === "password") {
    return (
      <form noValidate onSubmit={submitPassword} className="flex flex-col gap-8">
        <AuthHeading title="Новый пароль" subtitle="Придумайте новый надежный пароль для вашего аккаунта" />
        <FormAlert message={errors.form} />
        <TextField
          label="Новый пароль"
          type="password"
          name="password"
          autoComplete="new-password"
          autoFocus
          value={password}
          error={errors.password}
          hint={<PasswordRequirements password={password} />}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors((prev) => ({ ...prev, password: undefined, form: undefined }));
          }}
        />
        <TextField
          label="Повторите пароль"
          type="password"
          name="password_confirmation"
          autoComplete="new-password"
          value={confirmation}
          error={errors.confirmation}
          onChange={(e) => {
            setConfirmation(e.target.value);
            setErrors((prev) => ({ ...prev, confirmation: undefined, form: undefined }));
          }}
        />
        <SubmitButton loading={loading} ready={Boolean(password && confirmation)}>
          Сохранить
        </SubmitButton>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <AuthHeading title="Пароль изменен" subtitle="Теперь вы можете войти в свой аккаунт" />
      <Link
        href="/login"
        className="flex h-10 w-[212px] items-center justify-center rounded-[3px] bg-hoffman-black text-[14px] leading-[1.15] font-medium tracking-[-0.56px] text-hoffman-light-blue"
      >
        Войти
      </Link>
    </div>
  );
}
