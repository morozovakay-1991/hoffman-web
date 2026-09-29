/* eslint-disable @next/next/no-img-element -- бейджи сторов — SVG из макета */
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/lib/site";

// Бейджи App Store / Google Play (Figma 1228:3446, 1228:3447). App Store в
// макете собран из четырёх векторов — раскладка слоёв повторяет макет.
// `light` — белые бейджи футера, `dark` — чёрные (лендинг, 1344:7574).
export function StoreBadges({ id, tone = "light" }: { id?: string; tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <div id={id} className="flex items-center gap-10">
      <StoreLink href={APP_STORE_URL} label="Загрузить в App Store">
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
      <StoreLink href={GOOGLE_PLAY_URL} label="Скачать из Google Play">
        <img src={dark ? "/icons/google-play-dark.svg" : "/icons/google-play.svg"} alt="" width={136} height={40} className="block" />
      </StoreLink>
    </div>
  );
}

function StoreLink({ href, label, children }: { href: string | null; label: string; children: React.ReactNode }) {
  if (!href) {
    return (
      <span role="img" aria-label={label}>
        {children}
      </span>
    );
  }
  return (
    <a href={href} aria-label={label} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}
