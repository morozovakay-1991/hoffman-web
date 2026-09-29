import { notFound } from "next/navigation";
import type { NextRequest } from "next/server";
import { startSocialLogin } from "@/features/auth/server/social";
import { isSocialProvider } from "@/features/auth/types";

export async function GET(request: NextRequest, ctx: RouteContext<"/api/auth/[provider]/start">) {
  const { provider } = await ctx.params;
  if (!isSocialProvider(provider)) notFound();
  return startSocialLogin(request, provider);
}
