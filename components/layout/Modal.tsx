"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ArrowIcon } from "@/features/legal/components/ArrowIcon";

type ModalProps = {
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

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Модалка кабинета: затемнение 50%, панель 700px на light-blue со «стеклом»,
 * крестик — иконка `AddRounded`, повёрнутая на 45° (Figma 1254:13561).
 * Рендерится в <body> через портал; остальная страница на это время `inert`.
 * Esc и клик по затемнению закрывают её, фокус остаётся внутри, а после закрытия
 * возвращается на кнопку, которая её открыла. На узких экранах (мобильного макета
 * нет) панель во всю ширину с меньшими полями — чтобы 6 ячеек кода помещались в 320px.
 */
export function Modal({ title, subtitle, onClose, onBack, busy = false, tallTitle = false, children }: ModalProps) {
  const titleId = useId();
  const subtitleId = useId();
  const overlay = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const busyRef = useRef(busy);
  // Открывший модалку элемент запоминаем при первом рендере: к эффекту фокус уже
  // забрало поле с autoFocus внутри модалки.
  const [opener] = useState(() => (typeof document === "undefined" ? null : (document.activeElement as HTMLElement | null)));
  const initialFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    closeRef.current = onClose;
    busyRef.current = busy;
  });

  useEffect(() => {
    const node = panel.current;
    const root = overlay.current;
    if (!node || !root) return;
    // autoFocus поля внутри модалки срабатывает раньше — не перебиваем его
    // (и возвращаемся к нему при повторном запуске эффекта в StrictMode).
    if (node.contains(document.activeElement)) initialFocus.current = document.activeElement as HTMLElement;
    const target = initialFocus.current?.isConnected ? initialFocus.current : node.querySelector<HTMLElement>(FOCUSABLE);
    target?.focus();

    const background = [...document.body.children].filter((el) => el !== root && !el.hasAttribute("inert"));
    background.forEach((el) => el.setAttribute("inert", ""));
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
        if (event.shiftKey && (document.activeElement === first || !node.contains(document.activeElement))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !node.contains(document.activeElement))) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      background.forEach((el) => el.removeAttribute("inert"));
      document.body.style.overflow = overflow;
      if (opener?.isConnected) opener.focus();
    };
  }, [opener]);

  return createPortal(
    <div
      ref={overlay}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 py-4 sm:px-4 sm:py-10 lg:pt-[167px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitle ? subtitleId : undefined}
        className="relative w-full max-w-[700px] min-h-[476px] rounded-[5px] border-[0.5px] border-hoffman-light-blue bg-glass-tint px-4 pt-[67.5px] pb-[54px] text-hoffman-black backdrop-blur-[7.5px] sm:px-[54.5px]"
      >
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={busy}
            aria-label="Назад"
            className="tap-target absolute top-0 left-0 flex h-[34px] items-center pl-4 disabled:opacity-60 max-sm:size-11 max-sm:justify-center max-sm:pl-0"
          >
            <ArrowIcon back />
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          aria-label="Закрыть"
          className="tap-target absolute top-0 right-0 flex size-[34px] items-center justify-center disabled:opacity-60 max-sm:size-11"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- иконка SVG из макета */}
          <img src="/icons/add-rounded.svg" alt="" width={24} height={24} className="rotate-45" />
        </button>

        <div className="flex flex-col gap-[54px]">
          <div className={`flex flex-col gap-8 ${tallTitle ? "min-h-[83px]" : ""}`}>
            <h2 id={titleId} className="text-[2.25rem] leading-[1.15] font-normal break-words hyphens-auto sm:hyphens-manual">
              {title}
            </h2>
            {subtitle && (
              <div id={subtitleId} className="text-[0.875rem] leading-[1.5] [overflow-wrap:anywhere]">
                {subtitle}
              </div>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
