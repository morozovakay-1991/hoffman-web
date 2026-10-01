import Link from "next/link";
import type { LegalDocumentSummary } from "../types";
import { ArrowIcon } from "./ui";
import { menuRowClass } from "../styles";

/** Список `GET /legal-documents`; документ открывается на публичной странице /legal/{slug}. */
export function LegalDocumentList({ documents }: { documents: LegalDocumentSummary[] }) {
  if (documents.length === 0) {
    return <p className="text-[14px] leading-[1.5]">Документы пока не опубликованы</p>;
  }
  return (
    <ul className="flex flex-col gap-8">
      {documents.map((document) => (
        <li key={document.slug}>
          <Link href={`/legal/${encodeURIComponent(document.slug)}`} className={`${menuRowClass} hover:bg-white`}>
            {document.title}
            <ArrowIcon className="invisible group-hover:visible" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
