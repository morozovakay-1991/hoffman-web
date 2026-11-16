"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Контейнер с горизонтальной прокруткой (слайдер на нативном overflow-x + scroll-snap).
 * Пока содержимое действительно прокручивается, это фокусируемая область с подписью:
 * с клавиатуры её листают стрелками. Когда прокрутки нет (десктопная сетка) —
 * обычный блок без лишней остановки Tab.
 */
export function ScrollRegion({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(true);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const update = () => setScrollable(node.scrollWidth > node.clientWidth + 1);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      role={scrollable ? "region" : undefined}
      aria-label={scrollable ? label : undefined}
      tabIndex={scrollable ? 0 : undefined}
      className={className}
    >
      {children}
    </div>
  );
}
