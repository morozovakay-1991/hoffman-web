import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { AccountHeaderNav } from "@/features/profile/components/AccountHeaderNav";
import { GraduateBlock } from "@/features/profile/components/GraduateBlock";
import { ProfileMenu } from "@/features/profile/components/ProfileMenu";
import { getVerificationRequest, requireProfile } from "@/features/profile/server/profile";

// Личный кабинет (Figma 1273:5793): шапка и футер — общие с публичными страницами
// и экранами входа; слева блок выпускника и меню, справа — раздел (page.tsx).
// Уже 1024px колонки остаются рядом, левая сужается до половины; на мобильном
// блок выпускника и меню идут списком над разделом.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();
  // Прошлая заявка нужна только форме верификации — подтверждённому выпускнику не запрашиваем.
  const previousRequest = profile.graduate_status === "confirmed" ? null : await getVerificationRequest();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-white text-hoffman-black">
      <SiteHeader nav={<AccountHeaderNav />} />
      <main id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none lg:flex-row">
        <h1 className="sr-only">Личный кабинет</h1>
        <div className="flex flex-col gap-8 px-4 py-8 lg:w-[min(716px,50%)] lg:px-6 lg:shrink-0 lg:gap-[54px] lg:py-[54px]">
          <div className="lg:max-w-[590px]">
            <GraduateBlock status={profile.graduate_status} previousRequest={previousRequest} />
          </div>
          <div className="lg:max-w-[590px]">
            <ProfileMenu />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
