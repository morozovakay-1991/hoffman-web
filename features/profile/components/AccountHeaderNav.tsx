import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

/**
 * Навигация шапки в личном кабинете (Figma 1273:5799): «Личный кабинет» —
 * текущий раздел (blue-tint, подчёркнут), «Начать бесплатно», «Скачать
 * приложение» (к бейджам сторов в футере) и «Выйти».
 */
export function AccountHeaderNav() {
  return (
    <nav aria-label="Основная навигация" className="flex items-center text-[17px] leading-[1.4]">
      <Link href="/dashboard" aria-current="page" className="hidden text-hoffman-blue-tint underline md:block">
        Личный кабинет
      </Link>
      <Link href="/register" className="ml-[92px] hidden md:block">
        Начать бесплатно
      </Link>
      <a href="#download-app" className="ml-[85px] hidden md:block">
        Скачать приложение
      </a>
      <div className="md:ml-[71px]">
        <LogoutButton variant="header" />
      </div>
    </nav>
  );
}
