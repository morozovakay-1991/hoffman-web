import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  /** `light` — белые текст и линия поверх фото на лендинге (Figma 1313:2364). */
  tone?: "dark" | "light";
  /** Куда ведёт «Скачать приложение»: на лендинге — в его блок загрузки, иначе — к бейджам в футере. */
  downloadHref?: string;
  /** Навигация вместо гостевой — в личном кабинете (Figma 1273:5796). */
  nav?: ReactNode;
};

// Шапка публичных страниц (Figma 1228:3412): лого, «Начать бесплатно»,
// «Скачать приложение», «Войти». Фона нет — на экране входа она лежит поверх фото.
export function SiteHeader({ tone = "dark", downloadHref = "#download-app", nav }: Props) {
  const light = tone === "light";
  return (
    <header
      className={`relative z-10 flex h-[60px] items-center justify-between border-b-[0.5px] px-6 ${
        light ? "border-white text-white" : "border-hoffman-black text-hoffman-black"
      }`}
    >
      <Link href="/" aria-label="Hoffman — на главную">
        <Image src="/brand/logo-mark.jpg" alt="" width={24} height={24} priority />
      </Link>
      {nav ?? (
        <nav aria-label="Основная навигация" className="flex items-center text-[17px] leading-[1.4]">
          <Link href="/register" className="hidden md:block">
            Начать бесплатно
          </Link>
          <a href={downloadHref} className="ml-[85px] hidden md:block">
            Скачать приложение
          </a>
          <Link href="/login" className="flex items-center gap-2 md:ml-[71px]">
            Войти
            {/* eslint-disable-next-line @next/next/no-img-element -- иконка SVG из макета */}
            <img src={light ? "/icons/login-icon-white.svg" : "/icons/login-icon.svg"} alt="" width={24} height={24} />
          </Link>
        </nav>
      )}
    </header>
  );
}
