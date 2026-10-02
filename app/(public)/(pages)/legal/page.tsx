import type { Metadata } from "next";
import { LegalDocumentList } from "@/features/profile/components/LegalDocumentList";
import { listLegalDocuments } from "@/features/profile/server/legal";

export const metadata: Metadata = { title: "Правовая информация — Hoffman" };

// Публичная страница: документы нужны и без входа (ссылки в футере и в согласиях).
export default async function LegalDocumentsPage() {
  const documents = await listLegalDocuments();
  return (
    <section className="px-6 py-[54px] lg:max-w-[638px]">
      <h1 className="mb-[73px] text-[32px] leading-[28px] font-normal">Правовая информация</h1>
      <LegalDocumentList documents={documents} />
    </section>
  );
}
