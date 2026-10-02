import "server-only";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import sanitizeHtml from "sanitize-html";
import { laravelFetch, readJson } from "@/lib/server/laravel";
import type { LegalDocument, LegalDocumentSummary } from "../types";

// Юридические документы публичные (без токена). Оба эндпоинта — Laravel API
// Resources, поэтому полезная нагрузка лежит в `data`.
// Тексты редактируются в админке, поэтому страницы рендерятся на каждый запрос,
// а не при сборке: правка документа видна сразу, и `next build` не зависит от backend.

async function legalGet<T>(path: string): Promise<T> {
  await connection();
  const response = await laravelFetch(path);
  if (!response) throw new Error("Hoffman API is unavailable");
  // Неизвестный slug — 404 NOT_FOUND от route-model binding.
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error(`GET ${path} failed with ${response.status}`);
  return ((await readJson(response)) as { data: T }).data;
}

/** `GET /legal-documents` — отсортированы по slug на backend. */
export function listLegalDocuments(): Promise<LegalDocumentSummary[]> {
  return legalGet<LegalDocumentSummary[]>("/legal-documents");
}

/** `GET /legal-documents/{slug}`; `body` очищается от всего, кроме разметки текста. */
export async function getLegalDocument(slug: string): Promise<LegalDocument> {
  const document = await legalGet<LegalDocument>(`/legal-documents/${encodeURIComponent(slug)}`);
  return { title: document.title, body: sanitizeLegalHtml(document.body ?? "") };
}

/**
 * HTML пишет администратор в RichEditor Filament, но выводится он через
 * dangerouslySetInnerHTML — оставляем только теги форматирования текста
 * и ссылки http(s)/mailto/tel, без скриптов, стилей и обработчиков.
 */
export function sanitizeLegalHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "hr", "strong", "b", "em", "i", "u", "s",
      "del", "sub", "sup", "blockquote", "ul", "ol", "li", "a", "table", "thead", "tbody", "tr", "th", "td",
    ],
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });
}
