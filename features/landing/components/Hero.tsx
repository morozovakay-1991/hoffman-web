import Image from "next/image";

/**
 * Hero (Figma 1313:2345): фото 1440×650 под светлой шапкой, слоган справа
 * и надпись «hoffman» 180px, низ которой обрезан краем фото.
 * Секция заезжает под шапку (60px), поэтому идёт с отрицательным отступом.
 * Высота и отступы — в rem: при увеличенном шрифте браузера слоган не наезжает на «hoffman».
 */
export function Hero() {
  return (
    <section className="relative -mt-[60px] h-[32.5rem] overflow-hidden lg:h-[40.625rem]">
      <Image src="/images/landing/hero.png" alt="" fill preload sizes="100vw" className="object-cover" />
      <div className="absolute inset-x-4 top-[7.5rem] flex flex-col gap-4 text-hoffman-light-blue lg:inset-x-auto lg:top-[10.875rem] lg:right-5 lg:w-[35.625rem] lg:max-w-[calc(100%-40px)]">
        <p className="text-[1.5rem] leading-[1.15] lg:text-[2.25rem]">
          Ежедневная внутренняя работа <br className="hidden lg:inline" />в вашем кармане
        </p>
        <p className="text-[0.875rem] leading-[1.15] font-medium">Мобильное приложение для iOS и Android</p>
      </div>
      {/*
       * Как в макете (1313:2345): строка 1.15em прижата к низу фото и уходит под него
       * на 0.2em (36px при 180px), отступ слева — 0.056em (10px). На узких экранах
       * эти пропорции заданы в em от размера шрифта, а сам размер не больше 24vw,
       * чтобы слово помещалось в 320px. Десктоп — прежние значения из макета.
       */}
      <h1 className="absolute bottom-[-0.2em] left-[0.056em] text-[length:min(6rem,24vw)] leading-[1.15] font-normal whitespace-nowrap text-white lg:top-[29.9375rem] lg:bottom-auto lg:left-[10px] lg:text-[11.25rem]">
        hoffman
      </h1>
    </section>
  );
}
