import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-brand-200 dark:border-brand-800">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/pricing">Тарифы</Link>
            <Link href="/login">Войти</Link>
          </div>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-brand-200 px-6 py-6 text-center text-sm text-brand-500 dark:border-brand-800">
        © {new Date().getFullYear()} Hoffman
      </footer>
    </div>
  );
}
