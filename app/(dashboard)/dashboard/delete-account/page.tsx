import type { Metadata } from "next";
import { DeleteAccountPanel } from "@/features/profile/components/DeleteAccountPanel";
import { ProfilePanel } from "@/features/profile/components/ui";

export const metadata: Metadata = { title: "Удаление аккаунта — Hoffman" };

// Сессию проверяет layout кабинета (requireProfile) до рендера страницы.
export default function DeleteAccountPage() {
  return (
    <ProfilePanel title="Удаление аккаунта">
      <DeleteAccountPanel />
    </ProfilePanel>
  );
}
