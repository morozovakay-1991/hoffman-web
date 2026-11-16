import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { MobileMenu } from "./MobileMenu";
import { mobileMenuRowClass } from "./styles";

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
// Уже 768px пункты уходят в бургер-меню (мобильного макета нет).
export function SiteHeader({ tone = "dark", downloadHref = "#download-app", nav }: Props) {
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
      {nav ?? (
        <>
          <nav aria-label="Основная навигация" className="hidden items-center text-[1.0625rem] leading-[1.4] md:flex">
            <Link href="/register" className="tap-target relative">
              Начать бесплатно
            </Link>
            <a href={downloadHref} className="tap-target relative ml-[85px]">
              Скачать приложение
            </a>
            <Link href="/login" className="tap-target relative ml-[71px] flex items-center gap-2">
              Войти
              {/* eslint-disable-next-line @next/next/no-img-element -- иконка SVG из макета */}
              <img src={light ? "/icons/login-icon-white.svg" : "/icons/login-icon.svg"} alt="" width={24} height={24} />
            </Link>
          </nav>
          <MobileMenu label="Основная навигация" className="md:hidden">
            <li>
              <Link href="/register" className={mobileMenuRowClass}>
                Начать бесплатно
              </Link>
            </li>
            <li>
              <a href={downloadHref} className={mobileMenuRowClass}>
                Скачать приложение
              </a>
            </li>
            <li>
              <Link href="/login" className={mobileMenuRowClass}>
                Войти
                {/* eslint-disable-next-line @next/next/no-img-element -- иконка SVG из макета */}
                <img src="/icons/login-icon.svg" alt="" width={24} height={24} />
              </Link>
            </li>
          </MobileMenu>
        </>
      )}
    </header>
  );
}
