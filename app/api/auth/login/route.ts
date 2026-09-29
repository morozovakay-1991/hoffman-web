import type { NextRequest } from "next/server";
import { forwardAuthRequest } from "@/features/auth/server/bff";

export function POST(request: NextRequest) {
  return forwardAuthRequest(request, "/auth/login", { issuesToken: true });
}
