import Image from "next/image";

/**
 * Скриншот экрана в макете iPhone (компонент «iphone 17 pro» в Figma):
 * рамка blue-tint 282×593 → чёрный корпус → экран 265×576 со скруглением 56.
 * Скриншоты экранов — длинные, в экран попадает только их верх: `image` —
 * положение картинки внутри экрана из макета, в процентах.
 */
function PhoneMockup({
  src,
  image,
  shadow = "phone",
}: {
  src: string;
  image: { height: string; left: string; top: string };
  shadow?: "phone" | "phone-wide";
}) {
  return (
    <div
      className={`relative h-[593.05px] w-[282.028px] ${
        shadow === "phone" ? "drop-shadow-phone" : "drop-shadow-phone-wide"
      }`}
    >
      <div className="absolute inset-0 rounded-[69px] bg-hoffman-blue-tint" />
      <div className="absolute inset-[3.29px] rounded-[64px] bg-hoffman-black" />
      <div className="absolute inset-[8.57px] overflow-hidden rounded-[56px]">
        <div className="absolute w-full" style={image}>
          <Image src={src} alt="" fill sizes="265px" className="object-cover object-top" />
        </div>
      </div>
    </div>
  );
}

type Feature = {
  title: string;
  /** Строки описания — переносы как в макете. */
  lines: string[];
  descriptionWidth: number;
};

function FeatureCaption({ title, lines, descriptionWidth }: Feature) {
  return (
    <div className="flex flex-col items-center gap-4 text-center" style={{ width: descriptionWidth }}>
      <h3 className="text-[28px] leading-[34px] font-normal">{title}</h3>
      <p className="text-[14px] leading-[1.5] font-medium">
        {lines.map((line, i) => (
          <span key={line}>
            {i > 0 && <br />}
            {line}
          </span>
        ))}
      </p>
    </div>
  );
}

/**
 * «Возможности» (Figma 1313:5905, 1313:5914): заголовок и четыре колонки
 * «макет телефона + подпись». В третьей колонке — два повёрнутых макета.
 */
export function FeaturesSection() {
  return (
    <section className="overflow-hidden pt-[67px] pb-[47px]">
      <div className="px-6 lg:px-[30px]">
        <h2 className="text-[48px] leading-[1.15] font-normal lg:text-[80px]">Возможности</h2>
        <p className="mt-4 max-w-[390px] text-[14px] leading-[1.5] font-medium lg:ml-2">
          Четыре инструмента для системной работы над собой <br className="hidden lg:inline" />– каждый день, в
          своем темпе.
        </p>
      </div>

      <div className="mt-7 grid grid-cols-1 justify-items-center gap-y-16 md:grid-cols-2 xl:grid-cols-[282px_282px_445px_282px] xl:justify-center xl:gap-x-[30px]">
        <FeatureColumn
          phones={
            <div className="pt-9">
              <PhoneMockup
                src="/images/landing/screen-meditations.png"
                image={{ height: "394.96%", left: "-0.28%", top: "0.1%" }}
              />
            </div>
          }
          feature={{
            title: "Медитации",
            lines: ["Аудиопрактики для работы", "с состоянием, вниманием", "и эмоциональными реакциями"],
            descriptionWidth: 235,
          }}
        />
        <FeatureColumn
          phones={
            <div className="pt-[35px]">
              <PhoneMockup
                src="/images/landing/screen-articles.png"
                image={{ height: "338.24%", left: "-0.04%", top: "-0.03%" }}
                shadow="phone-wide"
              />
            </div>
          }
          feature={{
            title: "Инструменты",
            lines: ["Техники и упражнения для работы с внутренними реакциями", "и повторяющимися сценариями"],
            descriptionWidth: 242,
          }}
        />
        <FeatureColumn
          phones={
            <div className="relative h-[716.38px] w-[445.48px] shrink-0 origin-top max-sm:scale-[0.85]">
              <div className="absolute top-0 left-0 flex h-[628.12px] w-[366.3px] items-center justify-center">
                <div className="rotate-[-8.47deg]">
                  <PhoneMockup
                    src="/images/landing/screen-tools.png"
                    image={{ height: "315.05%", left: "-0.13%", top: "0.14%" }}
                  />
                </div>
              </div>
              <div className="absolute top-[85.8px] left-[115.5px] flex h-[614.29px] w-[329.98px] items-center justify-center">
                <div className="rotate-[4.73deg]">
                  <PhoneMockup
                    src="/images/landing/screen-themes.png"
                    image={{ height: "159.93%", left: "-0.36%", top: "-0.02%" }}
                  />
                </div>
              </div>
            </div>
          }
          feature={{
            title: "Статьи",
            lines: ["Анонсы, новости и тексты, связанные с Процессом Хоффмана и темами, которые в нем поднимаются"],
            descriptionWidth: 265,
          }}
        />
        <FeatureColumn
          phones={
            <div className="pt-10">
              <PhoneMockup
                src="/images/landing/screen-diary.png"
                image={{ height: "150.96%", left: "0.05%", top: "0.08%" }}
              />
            </div>
          }
          feature={{
            title: "Дневник",
            lines: ["Упражнения для самостоятельной работы в течение 100 дней после прохождения Процесса Хоффмана"],
            descriptionWidth: 261,
          }}
        />
      </div>
    </section>
  );
}

/** Колонка: область макетов высотой 716px (подписи в макете выровнены по одной линии) и подпись. */
function FeatureColumn({ phones, feature }: { phones: React.ReactNode; feature: Feature }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-[716.38px] justify-center">{phones}</div>
      <FeatureCaption {...feature} />
    </div>
  );
}
