import Image from "next/image";
import Link from "next/link";

// Шапка публичных страниц (Figma 1228:3412): лого, «Начать бесплатно»,
// «Скачать приложение», «Войти». Фона нет — на экране входа она лежит поверх фото.
export function SiteHeader() {
  return (
    <header className="relative z-10 flex h-[60px] items-center justify-between border-b-[0.5px] border-hoffman-black px-6 text-hoffman-black">
      <Link href="/" aria-label="Hoffman — на главную">
        <Image src="/brand/logo-mark.jpg" alt="" width={24} height={24} priority />
      </Link>
      <nav aria-label="Основная навигация" className="flex items-center text-[17px] leading-[1.4]">
        <Link href="/register" className="hidden md:block">
          Начать бесплатно
        </Link>
        <a href="#download-app" className="ml-[85px] hidden md:block">
          Скачать приложение
        </a>
        <Link href="/login" className="flex items-center gap-2 md:ml-[71px]">
          Войти
          {/* eslint-disable-next-line @next/next/no-img-element -- иконка SVG из макета */}
          <img src="/icons/login-icon.svg" alt="" width={24} height={24} />
        </Link>
      </nav>
    </header>
  );
}
