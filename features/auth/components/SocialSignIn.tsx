/* eslint-disable @next/next/no-img-element -- логотипы Apple / Google — SVG из макета */
import { PROVIDER_NAMES } from "../messages";
import type { SocialProvider } from "../types";

// Блок «Войти с» (Figma 1228:3476): логотипы Apple (30×36) и Google (30×30).
// Обычные <a>, а не next/link: это Route Handlers с редиректом к провайдеру,
// их нельзя префетчить.
export function SocialSignIn({ from }: { from: "login" | "register" }) {
  return (
    <div className="flex w-[125px] flex-col items-center gap-3">
      <p className="text-[12px] leading-[1.15] text-hoffman-dark">Войти с</p>
      <div className="flex w-full items-end justify-between">
        <SocialLink provider="apple" from={from}>
          <img src="/icons/apple.svg" alt="" width={30} height={36} />
        </SocialLink>
        <SocialLink provider="google" from={from}>
          <img src="/icons/google.svg" alt="" width={29.9994} height={30.0001} />
        </SocialLink>
      </div>
    </div>
  );
}

function SocialLink({ provider, from, children }: { provider: SocialProvider; from: string; children: React.ReactNode }) {
  return (
    <a
      href={`/api/auth/${provider}/start?from=${from}`}
      aria-label={`Войти через ${PROVIDER_NAMES[provider]}`}
      className="block rounded-[3px] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-hoffman-black"
    >
      {children}
    </a>
  );
}
