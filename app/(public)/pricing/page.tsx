const plans = [
  { name: "Базовый", price: "—" },
  { name: "Про", price: "—" },
  { name: "Бизнес", price: "—" },
];

export default function PricingPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <h1 className="text-3xl font-semibold tracking-tight">Тарифы</h1>
      <p className="mt-2 text-brand-600 dark:text-brand-300">
        Тарифные планы появятся здесь на следующем этапе.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="rounded-2xl border border-brand-200 p-6 dark:border-brand-800"
          >
            <h2 className="text-lg font-medium">{plan.name}</h2>
            <p className="mt-2 text-brand-500">{plan.price}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
