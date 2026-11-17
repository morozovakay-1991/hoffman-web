/** `LegalDocumentSummaryResource` — элемент `data` в `GET /legal-documents`. */
export type LegalDocumentSummary = {
  slug: string;
  title: string;
  updated_at: string;
};

/** `LegalDocumentResource` — `data` в `GET /legal-documents/{slug}`. `body` — HTML из RichEditor админки. */
export type LegalDocument = {
  title: string;
  body: string;
};
