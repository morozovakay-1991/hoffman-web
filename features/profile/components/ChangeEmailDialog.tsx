"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState, type FormEvent } from "react";
import { isEmailTaken } from "@/features/auth/api";
import { CodeInput, emptyCode } from "@/features/auth/components/CodeInput";
import { RESEND_COOLDOWN_SECONDS } from "@/features/auth/components/ForgotPasswordFlow";
import { FieldError, FormAlert, SubmitButton, TextField, linkClass } from "@/features/auth/components/ui";
import { AuthErrorText, tooManyAttemptsWait } from "@/features/auth/messages";
import type { ApiError } from "@/features/auth/types";
import { validateCode, validateEmail } from "@/features/auth/validation";
import { profileApi } from "../api";
import { ProfileText, isSessionLost, profileErrorText } from "../messages";
import { ModalActions, ProfileModal } from "./ui";
import { secondaryButtonClass } from "../styles";

type Step = "email" | "code";

/** Ошибки `POST /profile/email/confirm` (EmailChangeService::confirm). */
function codeErrorText(error: ApiError): string | undefined {
  if (error.status === 429) return tooManyAttemptsWait(error.retryAfter ?? 60);
  switch (error.code) {
    case "INVALID_CODE":
    case "VALIDATION_ERROR":
      return AuthErrorText.invalidCode;
    case "CODE_EXPIRED":
      return AuthErrorText.codeExpired;
    // Код заблокирован, пока не запрошен новый.
    case "TOO_MANY_ATTEMPTS":
      return AuthErrorText.tooManyAttemptsNewCode;
  }
}

function useCountdown(seconds: number) {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (left <= 0) return;
    const timer = setTimeout(() => setLeft((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [left]);
  return [left, () => setLeft(seconds)] as const;
}

/**
 * Смена email: новый адрес (Figma 1254:12741) → `PATCH /profile/email` отправляет
 * на него код → 6 ячеек кода (1254:13256) → `POST /profile/email/confirm`.
 * До подтверждения email не меняется.
 */
export function ChangeEmailDialog({ currentEmail, onClose, onSaved }: { currentEmail: string | null; onClose: () => void; onSaved: (message: string) => void }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(currentEmail ?? "");
  const [code, setCode] = useState(emptyCode);
  const [errors, setErrors] = useState<Partial<Record<"email" | "code" | "form", string>>>({});
  const [loading, setLoading] = useState(false);
  const [secondsLeft, restartCooldown] = useCountdown(RESEND_COOLDOWN_SECONDS);
  const codeErrorId = useId();

  function handleSessionLost(error: ApiError): boolean {
    if (!isSessionLost(error)) return false;
    router.replace("/login");
    return true;
  }

  /** Отправляет код на новый адрес; повторный вызов заменяет код на backend. */
  async function requestCode(): Promise<boolean> {
    setLoading(true);
    const result = await profileApi.requestEmailChange(email.trim());
    setLoading(false);
    if (result.ok) {
      setCode(emptyCode());
      setErrors({});
      restartCooldown();
      return true;
    }
    const { error } = result;
    if (handleSessionLost(error)) return false;
    if (isEmailTaken(error)) {
      setStep("email");
      setErrors({ email: AuthErrorText.emailTaken });
    } else if (error.code === "VALIDATION_ERROR" && error.fields.new_email) {
      setStep("email");
      setErrors({ email: AuthErrorText.emailInvalid });
    } else {
      setErrors({ form: profileErrorText(error) });
    }
    return false;
  }

  async function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = email.trim();
    const emailError =
      validateEmail(trimmed) ??
      (currentEmail && currentEmail.toLowerCase() === trimmed.toLowerCase() ? ProfileText.sameEmail : undefined);
    setErrors({ email: emailError });
    if (emailError) return;
    if (await requestCode()) setStep("code");
  }

  async function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = code.join("");
    const codeError = validateCode(value);
    setErrors({ code: codeError });
    if (codeError) return;

    setLoading(true);
    const result = await profileApi.confirmEmail(value);
    setLoading(false);
    if (result.ok) {
      router.refresh();
      onSaved(ProfileText.emailChanged);
      return;
    }
    if (handleSessionLost(result.error)) return;
    const text = codeErrorText(result.error);
    setErrors(text ? { code: text } : { form: profileErrorText(result.error) });
  }

  if (step === "code") {
    return (
      <ProfileModal
        title="Введите код"
        subtitle={`Мы отправили 6-значный код на ${email.trim()}`}
        onClose={onClose}
        busy={loading}
      >
        <form noValidate onSubmit={submitCode} className="flex flex-col gap-[54px]">
          <div className="flex max-w-[362px] flex-col gap-2">
            <CodeInput
              tone="onTint"
              value={code}
              onChange={(value) => {
                setCode(value);
                setErrors({});
              }}
              error={errors.code}
              errorId={codeErrorId}
              disabled={loading}
            />
            {errors.code && <FieldError id={codeErrorId}>{errors.code}</FieldError>}
          </div>
          <div className="flex flex-col items-start gap-4">
            <FormAlert message={errors.form} />
            <SubmitButton loading={loading}>Отправить код</SubmitButton>
            {secondsLeft > 0 ? (
              <p className="text-[13px] leading-[18px] text-hoffman-soft-black" aria-live="polite">
                Отправить еще раз через {secondsLeft}с
              </p>
            ) : (
              <button type="button" disabled={loading} onClick={requestCode} className={linkClass}>
                Отправить еще раз
              </button>
            )}
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setStep("email");
                setErrors({});
              }}
              className={linkClass}
            >
              Изменить Email
            </button>
          </div>
        </form>
      </ProfileModal>
    );
  }

  return (
    <ProfileModal title="Email" onClose={onClose} busy={loading} tallTitle>
      <form noValidate onSubmit={submitEmail} className="flex flex-col gap-[54px]">
        <TextField
          label="Новый email"
          hideLabel
          tone="onTint"
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
        <ModalActions>
          <FormAlert message={errors.form} />
          <SubmitButton loading={loading}>Сохранить</SubmitButton>
          <button type="button" onClick={onClose} disabled={loading} className={secondaryButtonClass}>
            Отменить
          </button>
        </ModalActions>
      </form>
    </ProfileModal>
  );
}
