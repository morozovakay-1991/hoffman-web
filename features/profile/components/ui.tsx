"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

// Стили — из Figma (Mobile-app-UI): личный кабинет 1273:5793, модалки 1252:12587,
// 1254:12741, 1254:13256, 1254:12892, 1273:7235, 1273:7394.

/** `arrow_forward_RoundedFill` 16×16; `back` — та же иконка, развёрнутая (Figma 1273:7486). */
export function ArrowIcon({ className = "", back = false }: { className?: string; back?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- иконка SVG из макета
    <img
      src="/icons/arrow-forward.svg"
      alt=""
      width={16}
      height={16}
      className={`size-4 shrink-0 ${back ? "rotate-180" : ""} ${className}`}
    />
  );
}

/**
 * Правая панель кабинета (Figma 1252:12648): фото с прозрачностью 20%, заголовок 32px
 * и содержимое на 73px ниже.
 */
export function ProfilePanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-labelledby="profile-panel-title" className="relative isolate flex-1 px-6 pt-[54px] pb-[54px] lg:min-h-[742px]">
      {/* eslint-disable-next-line @next/next/no-img-element -- декоративный фон из макета, растягивается на всю панель */}
      <img
        src="/images/profile/panel-bg.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 size-full object-cover opacity-20"
      />
      <h1 id="profile-panel-title" className="text-[32px] leading-[28px] font-normal">
        {title}
      </h1>
      <div className="mt-[73px] lg:max-w-[590px]">{children}</div>
    </section>
  );
}

/**
 * Сообщение об успехе в духе snackbar мобильного приложения. Живой регион есть
 * всегда (иначе скринридер может не озвучить текст), но места не занимает.
 */
export function StatusMessage({ message, className = "" }: { message?: string; className?: string }) {
  return (
    <p role="status" className={`text-[14px] leading-[1.5] empty:hidden ${className}`}>
      {message}
    </p>
  );
}

type ProfileModalProps = {
  title: string;
  /** Подзаголовок под заголовком (Figma 1274:7568: 14/1.5, на 32px ниже заголовка). */
  subtitle?: ReactNode;
  onClose: () => void;
  /** Стрелка «назад» слева сверху (Figma 1273:7486). */
  onBack?: () => void;
  /** Пока идёт запрос, закрыть модалку нельзя: его результат решает, куда попадёт пользователь. */
  busy?: boolean;
  /** Высота заголовка как в макете (83px у модалок с полем ввода). */
  tallTitle?: boolean;
  children: ReactNode;
};

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Модалка кабинета: затемнение 50%, панель 700px на light-blue со «стеклом»,
 * крестик — иконка `AddRounded`, повёрнутая на 45° (Figma 1254:13561).
 * Esc и клик по затемнению закрывают её, фокус остаётся внутри.
 */
export function ProfileModal({ title, subtitle, onClose, onBack, busy = false, tallTitle = false, children }: ProfileModalProps) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const busyRef = useRef(busy);

  useEffect(() => {
    closeRef.current = onClose;
    busyRef.current = busy;
  });

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const node = panel.current;
    // autoFocus поля внутри модалки срабатывает раньше — не перебиваем его.
    if (node && !node.contains(document.activeElement)) {
      node.querySelectorAll<HTMLElement>(FOCUSABLE)[0]?.focus();
    }
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busyRef.current) {
        event.preventDefault();
        closeRef.current();
      } else if (event.key === "Tab" && node) {
        const items = [...node.querySelectorAll<HTMLElement>(FOCUSABLE)];
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-10 lg:pt-[167px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-[700px] min-h-[476px] rounded-[5px] border-[0.5px] border-hoffman-light-blue bg-glass-tint px-6 pt-[67.5px] pb-[54px] text-hoffman-black backdrop-blur-[7.5px] sm:px-[54.5px]"
      >
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={busy}
            aria-label="Назад"
            className="absolute top-0 left-0 flex h-[34px] items-center pl-4 disabled:opacity-60"
          >
            <ArrowIcon back />
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          aria-label="Закрыть"
          className="absolute top-0 right-0 flex size-[34px] items-center justify-center disabled:opacity-60"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- иконка SVG из макета */}
          <img src="/icons/add-rounded.svg" alt="" width={24} height={24} className="rotate-45" />
        </button>

        <div className="flex flex-col gap-[54px]">
          <div className={`flex flex-col gap-8 ${tallTitle ? "min-h-[83px]" : ""}`}>
            <h2 id={titleId} className="text-[36px] leading-[1.15] font-normal">
              {title}
            </h2>
            {subtitle && <div className="text-[14px] leading-[1.5]">{subtitle}</div>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

/** Кнопки модалки столбиком через 16px (Figma 1274:7569). */
export function ModalActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-col items-start gap-4">{children}</div>;
}
