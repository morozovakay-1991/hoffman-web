import Link from "next/link";

export default function LandingPage() {
  return (
    <section className="mx-auto flex max-w-5xl flex-col items-start gap-6 px-6 py-24">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        Hoffman
      </h1>
      <p className="max-w-xl text-brand-600 dark:text-brand-300">
        Каркас веб-приложения. Здесь появится описание продукта.
      </p>
      <Link
        href="/pricing"
        className="rounded-full bg-brand-black px-5 py-2.5 text-sm font-medium text-brand-white transition-colors hover:bg-brand-800 dark:bg-brand-white dark:text-brand-black dark:hover:bg-brand-200"
      >
        Смотреть тарифы
      </Link>
    </section>
  );
}
