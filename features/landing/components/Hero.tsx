import Image from "next/image";

/**
 * Hero (Figma 1313:2345): фото 1440×650 под светлой шапкой, слоган справа
 * и надпись «hoffman» 180px, низ которой обрезан краем фото.
 * Секция заезжает под шапку (60px), поэтому идёт с отрицательным отступом.
 */
export function Hero() {
  return (
    <section className="relative -mt-[60px] h-[520px] overflow-hidden lg:h-[650px]">
      <Image src="/images/landing/hero.png" alt="" fill preload sizes="100vw" className="object-cover" />
      <div className="absolute inset-x-6 top-[120px] flex flex-col gap-4 text-hoffman-light-blue lg:inset-x-auto lg:top-[174px] lg:right-5 lg:w-[570px]">
        <p className="text-[24px] leading-[1.15] lg:text-[36px]">
          Ежедневная внутренняя работа <br className="hidden lg:inline" />в вашем кармане
        </p>
        <p className="text-[14px] leading-[1.15] font-medium">Мобильное приложение для iOS и Android</p>
      </div>
      <h1 className="absolute top-[410px] left-[6px] text-[96px] leading-[1.15] font-normal text-white lg:top-[479px] lg:left-[10px] lg:text-[180px]">
        hoffman
      </h1>
    </section>
  );
}
