"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { PASSWORD_RULES } from "../validation";

// Стили — из Figma (Mobile-app-UI, 1228:3404 — веб-экран входа; 961:1317 — состояния ошибок).

/** Ссылка из макета (`link/Variant7`): 12px, cherry, подчёркнутая. */
export const linkClass = "tap-target relative text-[0.75rem] leading-[1.15] font-semibold text-hoffman-cherry underline";

/**
 * `onTint` — поле на светло-голубом фоне модалок личного кабинета (Figma 1252:12736,
 * 1254:12973): белая подложка и текст 20/28 вместо светло-голубой и 12px.
 */
export type FieldTone = "default" | "onTint";

export const fieldToneClass: Record<FieldTone, string> = {
  default: "bg-hoffman-light-blue text-[0.75rem] leading-[1.15] tracking-[-0.48px]",
  onTint: "bg-white text-[1.25rem] leading-[1.75rem]",
};

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string;
  error?: string;
  hint?: ReactNode;
  tone?: FieldTone;
  /** Подпись только для скринридеров — когда её роль играет заголовок модалки. */
  hideLabel?: boolean;
};

export function TextField({
  label,
  error,
  hint,
  className,
  required = true,
  tone = "default",
  hideLabel = false,
  ...props
}: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col">
      <div className={hideLabel ? "sr-only" : "flex min-h-10 items-center gap-1"}>
        <label htmlFor={id} className="text-[0.75rem] leading-[1.625rem] font-medium">
          {label}
        </label>
        {/* Звёздочка вне <label>, чтобы доступное имя поля оставалось «Email», а не «Email *». */}
        {required && !hideLabel && (
          <span aria-hidden="true" className="text-[1.0625rem] leading-[1.4]">
            *
          </span>
        )}
      </div>
      <input
        id={id}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`min-h-[3.3125rem] w-full rounded-[3px] border-[0.5px] p-[10px] text-hoffman-black placeholder:text-hoffman-soft-black focus-visible:outline-offset-0 ${
          hideLabel ? "" : "mt-[6px]"
        } ${fieldToneClass[tone]} ${
          error ? "border-hoffman-fire" : "border-transparent focus:border-hoffman-black"
        } ${className ?? ""}`}
        {...props}
      />
      {hint && (
        <div id={hintId} className="mt-2 text-[0.75rem] leading-[1.15] text-hoffman-soft-black">
          {hint}
        </div>
      )}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
}

/** Текст ошибки поля: связан с полем через aria-describedby и озвучивается сразу (role="alert"). */
export function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} role="alert" className="mt-2 text-[0.75rem] leading-[1.15] text-hoffman-fire">
      {children}
    </p>
  );
}

/**
 * Кнопка из макета: 212×40, radius 3. Пока обязательные поля не заполнены — серая
 * (как в макете 1228:3466), но остаётся нажимаемой, чтобы показать ошибки полей.
 */
export function SubmitButton({ children, loading, ready = true }: { children: ReactNode; loading: boolean; ready?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      aria-busy={loading || undefined}
      className={`tap-target relative flex min-h-10 w-[13.25rem] max-w-full items-center justify-center rounded-[3px] px-4 text-[0.875rem] leading-[1.15] font-medium tracking-[-0.56px] transition-colors disabled:opacity-60 ${
        ready ? "bg-hoffman-black text-hoffman-light-blue" : "bg-hoffman-grey text-hoffman-black"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * После неудачной отправки переводит фокус на первое поле с ошибкой — чтобы
 * пользователь клавиатуры и скринридера сразу попал к ней. Фокус ставится в эффекте,
 * т.е. после рендера с новыми ошибками (aria-invalid). `formRef` — на <form>.
 */
export function useFocusFirstInvalid() {
  const formRef = useRef<HTMLFormElement>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (attempt) formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [attempt]);
  return [formRef, () => setAttempt((value) => value + 1)] as const;
}

/** Ошибка формы целиком (сеть, 429, вход через Apple/Google) — в стиле ошибок макета. */
export function FormAlert({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-[0.75rem] leading-[1.15] text-hoffman-fire">
      {message}
    </p>
  );
}

/** Заголовок экрана: 80px на десктопе (1228:3410), 20px на мобильном макете (961:1322). */
export function AuthHeading({ title, subtitle }: { title: string; subtitle?: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 lg:gap-6">
      <h1 className="text-[2rem] leading-[1.15] font-normal break-words hyphens-auto lg:text-[5rem] lg:hyphens-manual">{title}</h1>
      {subtitle && <p className="text-[0.75rem] leading-[1.5] font-medium lg:ml-2 lg:text-[0.875rem]">{subtitle}</p>}
    </div>
  );
}

/** Требования к сложности пароля (`RegisterRequest::PASSWORD_REGEX`) с отметкой выполненных. */
export function PasswordRequirements({ password }: { password: string }) {
  return (
    <ul aria-label="Требования к паролю" className="flex flex-col gap-1">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(password);
        return (
          <li key={rule.id} data-met={met} className={met ? "text-hoffman-black" : undefined}>
            <span aria-hidden="true">{met ? "✓" : "•"}</span> {rule.label}
            <span className="sr-only">{met ? " — выполнено" : " — не выполнено"}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** «Нет аккаунта? Зарегистрируйтесь» (`checkbox/Variant4` в макете). */
export function AuthSwitchPrompt({ question, action, href }: { question: string; action: string; href: string }) {
  return (
    <p className="text-[0.75rem] leading-[1.15]">
      {question}{" "}
      <Link href={href} className="tap-target relative font-medium text-hoffman-cherry underline">
        {action}
      </Link>
    </p>
  );
}
