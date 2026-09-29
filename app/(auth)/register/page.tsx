import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { SocialSignIn } from "@/features/auth/components/SocialSignIn";
import { AuthSwitchPrompt } from "@/features/auth/components/ui";
import { socialErrorFromParams } from "@/features/auth/socialErrorFromParams";

export const metadata: Metadata = { title: "Регистрация — Hoffman" };

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const socialError = socialErrorFromParams(await searchParams);

  return (
    <>
      <RegisterForm initialError={socialError} />
      <div className="mt-16 flex flex-col items-center gap-6">
        <SocialSignIn from="register" />
        <AuthSwitchPrompt question="Есть аккаунт?" action="Войти" href="/login" />
      </div>
    </>
  );
}
