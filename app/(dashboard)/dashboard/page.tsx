import { requireUser } from "@/features/auth/server/currentUser";

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight">Личный кабинет</h1>
      <p className="mt-2 text-brand-600 dark:text-brand-300">Здравствуйте, {user.name}!</p>
    </section>
  );
}
