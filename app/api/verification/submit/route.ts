import type { NextRequest } from "next/server";
import { forwardSessionRequest } from "@/features/profile/server/bff";

// Тот же эндпоинт, что у мобильного приложения (VerificationRepository.submit).
export function POST(request: NextRequest) {
  return forwardSessionRequest(request, "/verification/submit", { method: "POST" });
}
