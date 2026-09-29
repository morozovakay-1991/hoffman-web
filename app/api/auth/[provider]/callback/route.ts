import { notFound } from "next/navigation";
import type { NextRequest } from "next/server";
import { callbackParams, completeSocialLogin } from "@/features/auth/server/social";
import { isSocialProvider } from "@/features/auth/types";

type Context = RouteContext<"/api/auth/[provider]/callback">;

async function handle(request: NextRequest, ctx: Context) {
  const { provider } = await ctx.params;
  if (!isSocialProvider(provider)) notFound();
  return completeSocialLogin(request, provider, await callbackParams(request));
}

// Google возвращает на callback GET-запросом, Apple (response_mode=form_post) — POST.
export const GET = handle;
export const POST = handle;
