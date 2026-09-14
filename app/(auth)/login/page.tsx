import Link from "next/link";

export default function LoginPage() {
  return (
    <form className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold tracking-tight">Вход</h1>
      <label className="flex flex-col gap-1 text-sm">
        Email
        <input
          type="email"
          name="email"
          className="rounded-lg border border-brand-300 px-3 py-2 dark:border-brand-700 dark:bg-transparent"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Пароль
        <input
          type="password"
          name="password"
          className="rounded-lg border border-brand-300 px-3 py-2 dark:border-brand-700 dark:bg-transparent"
        />
      </label>
      <button
        type="submit"
        className="mt-2 rounded-full bg-brand-black px-5 py-2.5 text-sm font-medium text-brand-white dark:bg-brand-white dark:text-brand-black"
      >
        Войти
      </button>
      <p className="text-center text-sm text-brand-500">
        Нет аккаунта?{" "}
        <Link href="/register" className="underline">
          Зарегистрироваться
        </Link>
      </p>
    </form>
  );
}
