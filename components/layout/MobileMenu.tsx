"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

/** Открыта модалка кабинета (например, «Выйти?» из этого меню) — меню её не трогает. */
const modalOpen = () => document.querySelector('[aria-modal="true"]') !== null;

/**
 * Бургер-меню шапки на узких экранах. Мобильных макетов нет — пункты те же, что
 * в десктопной шапке, оформлены строками меню кабинета на белой панели под шапкой.
 * Иконка нарисована линиями в цвет текста шапки (белая поверх фото лендинга).
 * `children` — элементы <li>.
 */
export function MobileMenu({ label, className = "", children }: { label: string; className?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const root = useRef<HTMLElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || modalOpen()) return;
      setOpen(false);
      button.current?.focus();
    }
    function onPointerDown(event: PointerEvent) {
      if (modalOpen() || root.current?.contains(event.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const line = "absolute left-0 h-[1.5px] w-6 bg-current transition-transform motion-reduce:transition-none";

  return (
    <nav ref={root} aria-label={label} className={className}>
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Меню"
        onClick={() => setOpen((value) => !value)}
        className="relative -mr-[10px] flex size-11 items-center justify-center"
      >
        <span aria-hidden="true" className="relative block h-[14px] w-6">
          <span className={`${line} top-0 ${open ? "translate-y-[6.25px] rotate-45" : ""}`} />
          <span className={`${line} top-[6.25px] ${open ? "scale-x-0" : ""}`} />
          <span className={`${line} bottom-0 ${open ? "-translate-y-[6.25px] -rotate-45" : ""}`} />
        </span>
      </button>
      <div
        id={panelId}
        hidden={!open}
        // Переход по ссылке (в т.ч. по якорю на той же странице) закрывает меню.
        onClick={(event) => {
          if ((event.target as Element).closest("a")) setOpen(false);
        }}
        className="absolute inset-x-0 top-full max-h-[calc(100dvh-60px)] overflow-y-auto border-b-[0.5px] border-hoffman-black bg-white px-4 py-4 text-hoffman-black [--focus-ring:#000000]"
      >
        <ul className="flex flex-col gap-2">{children}</ul>
      </div>
    </nav>
  );
}
