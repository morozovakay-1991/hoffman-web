import type { Metadata } from "next";
import { LegalDocumentList } from "@/features/profile/components/LegalDocumentList";
import { ProfilePanel } from "@/features/profile/components/ui";
import { listLegalDocuments } from "@/features/profile/server/legal";

export const metadata: Metadata = { title: "Правовая информация — Hoffman" };

export default async function DashboardLegalPage() {
  const documents = await listLegalDocuments();
  return (
    <ProfilePanel title="Правовая информация">
      <LegalDocumentList documents={documents} />
    </ProfilePanel>
  );
}
