/* eslint-disable @next/next/no-img-element -- иконки SVG из макета */
import Image from "next/image";

type AccessItem = { label: string; icon: string; iconSize: number; unavailable?: boolean; mirrored?: boolean };

const items = (withDiary: boolean): AccessItem[] => [
  { label: "Медитации", icon: "/icons/play-circle.svg", iconSize: 20 },
  { label: "Статьи", icon: "/icons/article.svg", iconSize: 24 },
  { label: "Инструменты", icon: "/icons/tools-wrench.svg", iconSize: 24 },
  {
    label: "Дневник 100 дней",
    icon: withDiary ? "/icons/menu-book.svg" : "/icons/menu-book-muted.svg",
    iconSize: 24,
    unavailable: !withDiary,
    // В макете иконка книги отражена по горизонтали.
    mirrored: true,
  },
];

const plans = [
  {
    title: "Для всех",
    items: items(false),
    description:
      "Оформите подписку и получите доступ к авторским медитациям, инструментам и статьям Института Хоффмана, раскрывающим подход и структуру Процесса.",
    descriptionWidth: 221,
  },
  {
    title: "Для выпускников",
    items: items(true),
    description:
      "Оформите подписку и подтвердите статус в профиле, чтобы получить доступ к материалам, специально разработанным для выпускников Процесса Хоффмана.",
    descriptionWidth: 235,
  },
];

/**
 * «Как устроен доступ» (Figma 1313:5726): фото 1440×650 с тонировкой
 * (две карточки 551px в ряд помещаются только с 1280px — до этого они друг под другом)
 * (blue-tint 20% + чёрный 20%) и две «стеклянные» карточки 551×338.
 */
export function AccessSection() {
  return (
    <section className="relative isolate overflow-hidden pt-[54px] pb-[39px] text-hoffman-light-blue xl:h-[40.625rem]">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <Image src="/images/landing/access.png" alt="" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-hoffman-black/20" />
        <div className="absolute inset-0 bg-hoffman-blue-tint/20" />
      </div>
      <h2 className="px-4 text-[3rem] leading-[1.15] font-normal lg:text-[5rem] lg:whitespace-nowrap">
        Как устроен доступ
      </h2>
      <p className="mt-4 max-w-[390px] px-4 lg:px-6 text-[0.875rem] leading-[1.5] font-medium">
        Базовый доступ для всех <br />и расширенный для выпускников Процесса
      </p>

      <div className="mt-[69px] flex flex-col items-center gap-8 px-4 xl:flex-row xl:justify-center xl:gap-[114px] xl:px-0">
        {plans.map((plan) => (
          <article
            key={plan.title}
            className="w-full border-[0.5px] lg:max-w-[551px] border-hoffman-light-blue bg-glass p-8 text-white backdrop-blur-[7.5px] lg:shrink-0 lg:p-[54px] xl:h-[21.125rem] xl:w-[551px]"
          >
            <h3 className="text-[2.25rem] leading-[1.15] font-normal">{plan.title}</h3>
            <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:gap-0 lg:mt-[55px]">
              <ul className="flex shrink-0 flex-col gap-[13px] sm:w-[220.5px]">
                {plan.items.map((item) => (
                  <li
                    key={item.label}
                    className={`flex min-h-6 gap-2 text-[0.875rem] leading-[1.5] font-medium ${
                      item.iconSize === 20 ? "items-end" : "items-center"
                    } ${item.unavailable ? "text-hoffman-blue-tint/50 line-through" : ""}`}
                  >
                    <img
                      src={item.icon}
                      alt=""
                      width={item.iconSize}
                      height={item.iconSize}
                      className={item.mirrored ? "-scale-x-100" : undefined}
                    />
                    {item.label}
                    {item.unavailable && <span className="sr-only"> — недоступно</span>}
                  </li>
                ))}
              </ul>
              <p
                className="text-[0.875rem] leading-[1.5] sm:mt-[3.5px] sm:w-[var(--desc-w)] sm:shrink-0"
                style={{ "--desc-w": `${plan.descriptionWidth}px` } as React.CSSProperties}
              >
                {plan.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
