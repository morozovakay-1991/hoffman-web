import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1">
      <aside className="hidden w-56 flex-col gap-6 border-r border-brand-200 px-6 py-8 dark:border-brand-800 sm:flex">
        <Link href="/dashboard">
          <Logo />
        </Link>
        <nav className="flex flex-col gap-3 text-sm text-brand-600 dark:text-brand-300">
          <Link href="/dashboard">Личный кабинет</Link>
        </nav>
      </aside>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
