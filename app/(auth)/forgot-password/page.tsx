import type { Metadata } from "next";
import { ForgotPasswordFlow } from "@/features/auth/components/ForgotPasswordFlow";

export const metadata: Metadata = { title: "Сброс пароля — Hoffman" };

export default function ForgotPasswordPage() {
  return <ForgotPasswordFlow />;
}
