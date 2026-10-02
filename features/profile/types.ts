// Ответы hoffman-backend для личного кабинета (проверено по app/Http/Resources).

/** `App\Enums\GraduateStatus`. По нему backend решает доступ к материалам выпускников. */
export type GraduateStatus = "unverified" | "pending" | "confirmed" | "rejected";

/** `ProfileResource` — `profile` в ответах `GET/PATCH /profile` и `POST /profile/email/confirm`. */
export type Profile = {
  id: number;
  name: string;
  email: string | null;
  timezone: string | null;
  graduate_status: GraduateStatus;
  email_verified_at: string | null;
  created_at: string;
};

/** `VerificationRequestResource` — `verification_request` из `/verification/submit` и `/verification/status`. */
export type VerificationRequest = {
  id: number;
  status: "pending" | "confirmed" | "rejected";
  last_name: string;
  first_name: string;
  phone: string;
  is_duplicate: boolean;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

/** `DeletionRequestResource` — `deletion_request` из `POST /profile/deletion-request` (201). */
export type DeletionRequest = {
  status: "pending" | "cancelled" | "completed";
  reason: string | null;
  scheduled_for: string;
  completed_at: string | null;
};

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
