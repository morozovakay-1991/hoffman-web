import type { Metadata } from "next";
import Link from "next/link";
import { AuthHeading } from "@/features/auth/components/ui";
import { primaryButtonClass, secondaryButtonClass } from "@/features/profile/styles";

export const metadata: Metadata = { title: "Аккаунт удален — Hoffman" };

// После DELETE /profile (сессия уже завершена). Веб-макета нет — тексты как на
// мобильном экране «Ваш аккаунт удален» (Figma 753:3884).
export default function AccountDeletedPage() {
  return (
    <div className="flex flex-col gap-16">
      <AuthHeading
        title="Ваш аккаунт удален"
        subtitle="Все ваши данные были успешно удалены из системы. Будем рады видеть вас снова!"
      />
      <div className="flex flex-col gap-4">
        <Link href="/login" className={primaryButtonClass}>
          Войти
        </Link>
        <Link href="/register" className={secondaryButtonClass}>
          Зарегистрироваться
        </Link>
      </div>
    </div>
  );
}
