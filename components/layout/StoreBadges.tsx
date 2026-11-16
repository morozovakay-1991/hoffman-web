/* eslint-disable @next/next/no-img-element -- бейджи сторов — SVG из макета */
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/lib/site";

// Бейджи App Store / Google Play (Figma 1228:3446, 1228:3447). App Store в
// макете собран из четырёх векторов — раскладка слоёв повторяет макет.
// `light` — белые бейджи футера, `dark` — чёрные (лендинг, 1344:7574).
// `stretch` — на мобильном бейджи делят ширину сетки пополам (по 4 из 8 колонок,
// зазор 8px), бейдж — по центру своей половины; с lg — как в макете.
export function StoreBadges({ id, tone = "light", stretch = false }: { id?: string; tone?: "light" | "dark"; stretch?: boolean }) {
  const dark = tone === "dark";
  return (
    <div
      id={id}
      className={
        stretch
          ? "grid grid-cols-2 gap-2 lg:flex lg:flex-wrap lg:items-center lg:gap-x-10 lg:gap-y-4"
          : "flex flex-wrap items-center gap-x-10 gap-y-4"
      }
    >
      <StoreLink href={APP_STORE_URL} label="Загрузить в App Store" stretch={stretch}>
        <span className="relative block h-10 w-[120px] overflow-hidden">
          <img src={dark ? "/icons/appstore-bg-dark.svg" : "/icons/appstore-bg.svg"} alt="" width={120} height={40} className="absolute inset-0" />
          <img
            src={dark ? "/icons/appstore-apple-white.svg" : "/icons/appstore-apple.svg"}
            alt=""
            width={17.7663}
            height={21.7762}
            className="absolute top-[21.8%] left-[8.33%]"
          />
          <img
            src={dark ? "/icons/appstore-label-white.svg" : "/icons/appstore-label.svg"}
            alt=""
            width={75.2713}
            height={15.6203}
            className="absolute top-[44.68%] left-[28.77%]"
          />
          <img
            src={dark ? "/icons/appstore-top-white.svg" : "/icons/appstore-top.svg"}
            alt=""
            width={50.8039}
            height={7.76075}
            className="absolute top-[21.43%] left-[29.54%]"
          />
        </span>
      </StoreLink>
      <StoreLink href={GOOGLE_PLAY_URL} label="Скачать из Google Play" stretch={stretch}>
        <img src={dark ? "/icons/google-play-dark.svg" : "/icons/google-play.svg"} alt="" width={136} height={40} className="block" />
      </StoreLink>
    </div>
  );
}

type StoreLinkProps = { href: string | null; label: string; stretch: boolean; children: React.ReactNode };

function StoreLink({ href, label, stretch, children }: StoreLinkProps) {
  const layout = stretch ? "flex min-h-[44px] items-center justify-center lg:block lg:min-h-0" : "";
  if (!href) {
    return (
      <span role="img" aria-label={label} className={layout || undefined}>
        {children}
      </span>
    );
  }
  return (
    <a href={href} aria-label={label} target="_blank" rel="noopener noreferrer" className={`tap-target relative ${layout || "block"}`}>
      {children}
    </a>
  );
}
