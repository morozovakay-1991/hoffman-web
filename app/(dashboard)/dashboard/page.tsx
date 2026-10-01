import type { Metadata } from "next";
import { PersonalDataPanel } from "@/features/profile/components/PersonalDataPanel";
import { ProfilePanel } from "@/features/profile/components/ui";
import { requireProfile } from "@/features/profile/server/profile";

export const metadata: Metadata = { title: "Личный кабинет — Hoffman" };

export default async function DashboardPage() {
  const profile = await requireProfile();

  return (
    <ProfilePanel title="Личные данные">
      <PersonalDataPanel profile={{ name: profile.name, email: profile.email }} />
    </ProfilePanel>
  );
}
