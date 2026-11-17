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
