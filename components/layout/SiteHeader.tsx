import Image from "next/image";
import Link from "next/link";

type Props = {
  /** `light` — белые текст и линия поверх фото на лендинге (Figma 1313:2364). */
  tone?: "dark" | "light";
};

// Шапка публичных страниц (Figma 1228:3412): лого. Фона нет — на лендинге она лежит поверх фото hero.
export function SiteHeader({ tone = "dark" }: Props) {
  const light = tone === "light";
  return (
    <header
      className={`relative z-10 flex min-h-[60px] items-center justify-between border-b-[0.5px] px-4 lg:px-6 ${
        light ? "border-white text-white [--focus-ring:#ffffff]" : "border-hoffman-black text-hoffman-black"
      }`}
    >
      <Link href="/" aria-label="Hoffman — на главную" className="tap-target relative">
        <Image src="/brand/logo-mark.jpg" alt="" width={24} height={24} priority />
      </Link>
    </header>
  );
}
