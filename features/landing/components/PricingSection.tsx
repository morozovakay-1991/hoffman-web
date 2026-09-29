"use client";

/* eslint-disable @next/next/no-img-element -- иконки SVG из макета */
import { useState } from "react";
import { ConsentCheckboxes, type Consents } from "@/features/auth/components/ConsentCheckboxes";
import { validateConsents } from "@/features/auth/validation";
import { Accent, ButtonLink, SectionIntro, introColumnClass } from "./ui";

type PlanId = "year" | "month";

const PLANS: Record<
  PlanId,
  { title: string; perMonth: string; badge?: string; oldPrice?: string; price?: string; renewal: string }
> = {
  year: { title: "Год", perMonth: "100 ₽", badge: "–33 %", oldPrice: "1800 ₽", price: "1200 ₽ / год", renewal: "1200 ₽ / год" },
  // В макете условия продления показаны только для годового тарифа — для месяца по аналогии.
  month: { title: "Месяц", perMonth: "150 ₽", renewal: "150 ₽ / мес" },
};

/**
 * «Тарифы» (Figma 1313:5799): выбор тарифа, кнопка пробного периода и обязательные
 * согласия (те же, что при регистрации). Без согласий кнопка не уводит на регистрацию.
 */
export function PricingSection() {
  const [plan, setPlan] = useState<PlanId>("year");
  const [consents, setConsents] = useState<Consents>({ privacy: false, personalData: false });
  const [consentError, setConsentError] = useState<string>();

  return (
    <section className="border-y-[0.5px] border-hoffman-black bg-hoffman-light-blue px-6 pt-[54px] pb-[54px]">
      <SectionIntro label="Тарифы">
        7 дней <Accent>бесплатно,</Accent> дальше на ваш выбор.
      </SectionIntro>

      <div className={introColumnClass}>
        <fieldset className="mt-16">
          <legend className="sr-only">Тариф</legend>
          <div className="flex flex-col gap-6 lg:flex-row">
            {(Object.keys(PLANS) as PlanId[]).map((id) => (
              <PlanCard key={id} id={id} selected={plan === id} onSelect={() => setPlan(id)} />
            ))}
          </div>
        </fieldset>

        <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-[26px]">
          <ButtonLink
            href="/register"
            variant="darkWhite"
            onClick={(e) => {
              const error = validateConsents(consents);
              if (error) {
                e.preventDefault();
                setConsentError(error);
              }
            }}
          >
            Попробовать 7 дней бесплатно
          </ButtonLink>
          <p className="w-[330px] max-w-full text-[14px] leading-[1.15] font-medium">
            Далее {PLANS[plan].renewal}. <br />
            Отмена в любой момент.
          </p>
        </div>

        <div className="mt-4 max-w-[361px]">
          <ConsentCheckboxes
            value={consents}
            error={consentError}
            onChange={(value) => {
              setConsents(value);
              setConsentError(undefined);
            }}
          />
        </div>
      </div>
    </section>
  );
}

function PlanCard({ id, selected, onSelect }: { id: PlanId; selected: boolean; onSelect: () => void }) {
  const { title, perMonth, badge, oldPrice, price } = PLANS[id];
  return (
    <label
      className={`relative block h-[168px] w-full cursor-pointer rounded-[3px] border-[0.5px] pt-[63px] pr-4 pl-6 sm:pr-[26px] sm:pl-[34px] has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-hoffman-black lg:w-[472px] ${
        selected ? "border-hoffman-black bg-white" : "border-white bg-hoffman-blue-tint"
      }`}
    >
      <input
        type="radio"
        name="plan"
        value={id}
        checked={selected}
        onChange={onSelect}
        aria-label={`${title}, ${perMonth} в месяц`}
        className="sr-only"
      />
      {badge && (
        <span className="absolute -top-3 left-6 rounded-[3px] bg-hoffman-black px-2.5 py-1 text-[14px] leading-[1.15] font-medium text-white">
          {badge}
        </span>
      )}
      <span className="flex items-center justify-between gap-4">
        <span className="text-[28px] leading-[1.15] sm:text-[36px]">{title}</span>
        <span className="flex items-center gap-3">
          <span className="leading-[1.15] whitespace-nowrap">
            <span className="text-[28px] sm:text-[36px]">{perMonth} </span>
            <span className="text-[14px]">мес</span>
          </span>
          <img src={selected ? "/icons/radio-checked.svg" : "/icons/radio.svg"} alt="" width={32} height={32} />
        </span>
      </span>
      {price && (
        <span className="mt-4 block text-[14px] leading-[1.15] font-medium whitespace-pre-wrap">
          <s className="text-hoffman-blue-tint">{oldPrice}</s>
          {"  "}
          {price}
        </span>
      )}
    </label>
  );
}
