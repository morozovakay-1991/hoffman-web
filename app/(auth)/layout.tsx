import Image from "next/image";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

// Экран входа (Figma 1228:3404): фото на всю ширину под шапкой и формой,
// слева — полупрозрачная белая панель 613px с формой. На узких экранах фото скрыто.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-white text-hoffman-black">
      <div className="relative flex flex-1 flex-col lg:min-h-[947px]">
        <div aria-hidden="true" className="absolute inset-0 hidden lg:block">
          <Image src="/images/auth-photo.png" alt="" fill priority sizes="100vw" className="object-cover object-bottom" />
          <div className="absolute inset-y-0 left-0 w-[613px] bg-white/80" />
        </div>
        <SiteHeader />
        <main className="relative flex-1 px-6 pt-16 pb-16 lg:w-[613px]">
          <div className="lg:max-w-[565px]">{children}</div>
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}
