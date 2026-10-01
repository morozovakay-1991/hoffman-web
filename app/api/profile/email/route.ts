import type { NextRequest } from "next/server";
import { forwardSessionRequest } from "@/features/profile/server/bff";

export function PATCH(request: NextRequest) {
  return forwardSessionRequest(request, "/profile/email", { method: "PATCH" });
}
