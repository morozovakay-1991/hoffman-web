import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
      <Link href="/">
        <Logo />
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-brand-200 p-8 dark:border-brand-800">
        {children}
      </div>
    </div>
  );
}
