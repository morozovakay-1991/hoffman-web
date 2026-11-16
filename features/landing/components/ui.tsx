import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

// Общие элементы лендинга (Figma: Mobile-app-UI, кадр 1313:2343).

/** Акцентная часть заголовка — цвет blue-tint (`Color/Accentss` в макете). */
export function Accent({ children }: { children: ReactNode }) {
  return <span className="text-hoffman-blue-tint">{children}</span>;
}

/**
 * Блок «подпись слева + крупный заголовок» (О приложении / Скачать приложение / Тарифы):
 * подпись 14px в колонке 328px, заголовок 56px (строка 64px, как в макете) начинается с x=378.
 */
export function SectionIntro({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[328px_minmax(0,1038px)] lg:gap-x-[26px]">
      <p className="text-[0.875rem] leading-[1.15] font-medium lg:pt-[17px]">{label}</p>
      <h2 className="text-[2rem] leading-[1.15] font-normal break-words lg:text-[3.5rem] lg:leading-[4rem]">{children}</h2>
    </div>
  );
}

/** Отступ содержимого под заголовком SectionIntro — до колонки заголовка. */
export const introColumnClass = "lg:ml-[354px]";

const buttonVariants = {
  // «Начать бесплатно» (1313:2357): чёрная, текст light-blue.
  dark: { className: "bg-hoffman-black text-hoffman-light-blue", icon: "/icons/arrow-forward-light-blue.svg" },
  // «Попробовать 7 дней бесплатно» (1313:5835): чёрная, текст белый.
  darkWhite: { className: "bg-hoffman-black text-white", icon: "/icons/arrow-forward-white.svg" },
  // «Скачать приложение» (1313:2360): light-blue с тонкой чёрной рамкой.
  light: {
    className: "h-10 border-[0.5px] border-hoffman-black bg-hoffman-light-blue text-hoffman-black",
    icon: "/icons/download.svg",
  },
} as const;

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, "className"> & {
  variant: keyof typeof buttonVariants;
  /** Только раскладка (ширина, выравнивание) — оформление задаёт `variant`. */
  layoutClassName?: string;
  children: ReactNode;
};

/** Кнопка-ссылка из макета: 14px Medium, padding 12/24, radius 3, иконка 16px справа. */
export function ButtonLink({ variant, layoutClassName = "", children, ...props }: ButtonLinkProps) {
  const { className, icon } = buttonVariants[variant];
  return (
    <Link
      {...props}
      className={`tap-target relative inline-flex max-w-full shrink-0 items-center gap-2 rounded-[3px] px-6 py-3 text-[0.875rem] leading-[1.15] font-medium sm:whitespace-nowrap focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-hoffman-black ${className} ${layoutClassName}`}
    >
      {children}
      {/* eslint-disable-next-line @next/next/no-img-element -- иконка SVG из макета */}
      <img src={icon} alt="" width={16} height={16} />
    </Link>
  );
}
