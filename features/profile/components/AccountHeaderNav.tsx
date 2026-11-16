import Link from "next/link";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { mobileMenuRowClass } from "@/components/layout/styles";
import { LogoutButton } from "./LogoutButton";

/**
 * Навигация шапки в личном кабинете (Figma 1273:5799): «Личный кабинет» —
 * текущий раздел (blue-tint, подчёркнут), «Начать бесплатно», «Скачать
 * приложение» (к бейджам сторов в футере) и «Выйти». Четыре пункта не помещаются
 * уже 1024px — там они в бургер-меню.
 */
export function AccountHeaderNav() {
  return (
    <>
      <nav aria-label="Основная навигация" className="hidden items-center text-[1.0625rem] leading-[1.4] lg:flex">
        <Link href="/dashboard" aria-current="page" className="tap-target relative text-hoffman-blue-tint underline">
          Личный кабинет
        </Link>
        <Link href="/register" className="tap-target relative ml-[92px]">
          Начать бесплатно
        </Link>
        <a href="#download-app" className="tap-target relative ml-[85px]">
          Скачать приложение
        </a>
        <div className="ml-[71px]">
          <LogoutButton variant="header" />
        </div>
      </nav>
      <MobileMenu label="Основная навигация" className="lg:hidden">
        <li>
          <Link href="/dashboard" aria-current="page" className={mobileMenuRowClass}>
            Личный кабинет
          </Link>
        </li>
        <li>
          <Link href="/register" className={mobileMenuRowClass}>
            Начать бесплатно
          </Link>
        </li>
        <li>
          <a href="#download-app" className={mobileMenuRowClass}>
            Скачать приложение
          </a>
        </li>
        <li>
          <LogoutButton variant="mobileMenu" />
        </li>
      </MobileMenu>
    </>
  );
}
