import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { SocialSignIn } from "@/features/auth/components/SocialSignIn";
import { AuthSwitchPrompt } from "@/features/auth/components/ui";
import { socialErrorFromParams } from "@/features/auth/socialErrorFromParams";

export const metadata: Metadata = { title: "Вход — Hoffman" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const socialError = socialErrorFromParams(await searchParams);

  return (
    <>
      <LoginForm initialError={socialError} />
      <div className="mt-16 flex flex-col items-center gap-6">
        <SocialSignIn from="login" />
        <AuthSwitchPrompt question="Нет аккаунта?" action="Зарегистрируйтесь" href="/register" />
      </div>
    </>
  );
}
