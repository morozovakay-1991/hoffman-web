"use client";

import { useState } from "react";
import type { GraduateStatus, VerificationRequest } from "../types";
import { ArrowIcon } from "./ui";
import { VerificationDialog } from "./VerificationDialog";

export const VERIFICATION_CTA = "Пройдите верификацию и получите доступ к расширенным возможностям приложения";

type Props = {
  status: GraduateStatus;
  /** Последняя заявка — форма начинается с её данных, чтобы при повторе только поправить. */
  previousRequest: VerificationRequest | null;
};

/**
 * Блок выпускника (Figma 1273:5833). Статус — `graduate_status` профиля: по нему
 * backend открывает материалы выпускников. Пока он не `confirmed`, показываем
 * CTA «Начать» — он открывает верификацию на том же `POST /verification/submit`,
 * что и мобильное приложение.
 */
export function GraduateBlock({ status, previousRequest }: Props) {
  const [open, setOpen] = useState(false);

  if (status === "confirmed") {
    // Подтверждённого состояния в веб-макете нет — текст как в мобильном (651:3747).
    return (
      <section className="flex flex-col gap-6 bg-hoffman-light-blue px-4 py-8" aria-label="Статус выпускника">
        <p className="text-[20px] leading-[1.15] tracking-[-0.8px]">Выпускник Процесса Хоффмана</p>
        <p className="text-[12px] leading-[1.15] tracking-[-0.48px]">Статус подтвержден</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col items-start gap-6 bg-hoffman-light-blue px-4 py-8" aria-label="Статус выпускника">
      <h2 className="text-[20px] leading-[1.15] font-normal tracking-[-0.8px]">Выпускник Процесса Хоффмана?</h2>
      <p className="max-w-[518px] text-[12px] leading-[1.15] tracking-[-0.48px]">{VERIFICATION_CTA}</p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-7 w-[130px] items-center justify-center gap-2 rounded-[4px] border-[0.5px] border-hoffman-black bg-white pr-2 pl-4 text-[12px] leading-[1.15] font-medium tracking-[-0.48px]"
      >
        Начать
        <ArrowIcon />
      </button>
      {open && <VerificationDialog previousRequest={previousRequest} onClose={() => setOpen(false)} />}
    </section>
  );
}
