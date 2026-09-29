"use client";

import Link from "next/link";
import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { PASSWORD_RULES } from "../validation";

// Стили — из Figma (Mobile-app-UI, 1228:3404 — веб-экран входа; 961:1317 — состояния ошибок).

/** Ссылка из макета (`link/Variant7`): 12px, cherry, подчёркнутая. */
export const linkClass = "text-[12px] leading-[1.15] font-semibold text-hoffman-cherry underline";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string;
  error?: string;
  hint?: ReactNode;
};

export function TextField({ label, error, hint, className, required = true, ...props }: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col">
      <div className="flex h-10 items-center gap-1">
        <label htmlFor={id} className="text-[12px] leading-[26px] font-medium">
          {label}
        </label>
        {/* Звёздочка вне <label>, чтобы доступное имя поля оставалось «Email», а не «Email *». */}
        {required && (
          <span aria-hidden="true" className="text-[17px] leading-[1.4]">
            *
          </span>
        )}
      </div>
      <input
        id={id}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`mt-[6px] h-[53px] w-full rounded-[3px] border-[0.5px] bg-hoffman-light-blue p-[10px] text-[12px] leading-[1.15] tracking-[-0.48px] text-hoffman-black outline-none placeholder:text-hoffman-soft-black ${
          error ? "border-hoffman-fire" : "border-transparent focus:border-hoffman-black"
        } ${className ?? ""}`}
        {...props}
      />
      {hint && (
        <div id={hintId} className="mt-2 text-[12px] leading-[1.15] text-hoffman-soft-black">
          {hint}
        </div>
      )}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
}

export function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-2 text-[12px] leading-[1.15] text-hoffman-fire">
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
      className={`flex h-10 w-[212px] items-center justify-center rounded-[3px] px-4 text-[14px] leading-[1.15] font-medium tracking-[-0.56px] transition-colors disabled:opacity-60 ${
        ready ? "bg-hoffman-black text-hoffman-light-blue" : "bg-hoffman-grey text-hoffman-black"
      }`}
    >
      {children}
    </button>
  );
}

/** Ошибка формы целиком (сеть, 429, вход через Apple/Google) — в стиле ошибок макета. */
export function FormAlert({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-[12px] leading-[1.15] text-hoffman-fire">
      {message}
    </p>
  );
}

/** Заголовок экрана: 80px на десктопе (1228:3410), 20px на мобильном макете (961:1322). */
export function AuthHeading({ title, subtitle }: { title: string; subtitle?: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 lg:gap-6">
      <h1 className="text-[32px] leading-[1.15] font-normal break-words lg:text-[80px]">{title}</h1>
      {subtitle && <p className="text-[12px] leading-[1.5] font-medium lg:ml-2 lg:text-[14px]">{subtitle}</p>}
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
    <p className="text-[12px] leading-[1.15]">
      {question}{" "}
      <Link href={href} className="font-medium text-hoffman-cherry underline">
        {action}
      </Link>
    </p>
  );
}
