import type { NextRequest } from "next/server";
import { forwardSessionRequest } from "@/features/profile/server/bff";

export function POST(request: NextRequest) {
  return forwardSessionRequest(request, "/profile/deletion-request", { method: "POST" });
}
