import type { Metadata } from "next";
import Link from "next/link";
import { getLegalDocument } from "@/features/profile/server/legal";

export async function generateMetadata({ params }: PageProps<"/legal/[slug]">): Promise<Metadata> {
  const { title } = await getLegalDocument((await params).slug);
  return { title: `${title} — Hoffman` };
}

export default async function LegalDocumentPage({ params }: PageProps<"/legal/[slug]">) {
  // Неизвестный slug — 404 от backend → notFound().
  const document = await getLegalDocument((await params).slug);

  return (
    <article className="px-4 py-[54px] lg:px-6 lg:max-w-[800px]">
      <Link href="/legal" className="tap-target relative text-[0.75rem] leading-[1.15] font-semibold text-hoffman-cherry underline">
        Правовая информация
      </Link>
      <h1 className="mt-6 text-[2rem] leading-[1.15] font-normal break-words hyphens-auto lg:hyphens-manual">{document.title}</h1>
      {/* HTML из админки, очищенный sanitizeLegalHtml на сервере. */}
      <div className="legal-body mt-8 text-[0.875rem] leading-[1.5]" dangerouslySetInnerHTML={{ __html: document.body }} />
    </article>
  );
}
