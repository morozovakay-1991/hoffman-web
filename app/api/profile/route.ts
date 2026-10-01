import type { NextRequest } from "next/server";
import { forwardSessionRequest } from "@/features/profile/server/bff";

export function PATCH(request: NextRequest) {
  return forwardSessionRequest(request, "/profile", { method: "PATCH" });
}

// Немедленное удаление: backend отзывает все токены, поэтому cookie сессии удаляем сразу.
export function DELETE(request: NextRequest) {
  return forwardSessionRequest(request, "/profile", { method: "DELETE", endsSession: true });
}
