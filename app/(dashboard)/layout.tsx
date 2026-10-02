import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { AccountHeaderNav } from "@/features/profile/components/AccountHeaderNav";
import { GraduateBlock } from "@/features/profile/components/GraduateBlock";
import { ProfileMenu } from "@/features/profile/components/ProfileMenu";
import { getVerificationRequest, requireProfile } from "@/features/profile/server/profile";

// Личный кабинет (Figma 1273:5793): шапка и футер — общие с публичными страницами
// и экранами входа; слева блок выпускника и меню, справа — раздел (page.tsx).
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();
  // Прошлая заявка нужна только форме верификации — подтверждённому выпускнику не запрашиваем.
  const previousRequest = profile.graduate_status === "confirmed" ? null : await getVerificationRequest();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-white text-hoffman-black">
      <SiteHeader nav={<AccountHeaderNav />} />
      <div className="flex flex-1 flex-col lg:flex-row">
        <aside className="flex flex-col gap-[54px] px-6 py-[54px] lg:w-[716px] lg:shrink-0">
          <div className="lg:max-w-[590px]">
            <GraduateBlock status={profile.graduate_status} previousRequest={previousRequest} />
          </div>
          <div className="lg:max-w-[590px]">
            <ProfileMenu />
          </div>
        </aside>
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
      <SiteFooter />
    </div>
  );
}
