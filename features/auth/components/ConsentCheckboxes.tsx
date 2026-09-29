"use client";

import { useId } from "react";
import Link from "next/link";
import { LEGAL_LINKS } from "@/lib/site";
import { FieldError } from "./ui";

export type Consents = { privacy: boolean; personalData: boolean };

type Props = {
  value: Consents;
  onChange: (value: Consents) => void;
  error?: string;
};

/**
 * Обязательные согласия под кнопкой (Figma 1228:3468; как ConsentCheckboxes в
 * мобильном приложении). При ошибке неотмеченные квадраты окрашиваются в fire.
 */
export function ConsentCheckboxes({ value, onChange, error }: Props) {
  const errorId = useId();
  return (
    <div className="flex flex-col gap-3">
      <ConsentRow
        checked={value.privacy}
        hasError={Boolean(error)}
        errorId={errorId}
        onChange={(privacy) => onChange({ ...value, privacy })}
        prefix="Я ознакомлен с "
        link={{ label: "политикой конфиденциальности", href: LEGAL_LINKS.privacy.href }}
      />
      <ConsentRow
        checked={value.personalData}
        hasError={Boolean(error)}
        errorId={errorId}
        onChange={(personalData) => onChange({ ...value, personalData })}
        prefix="Я согласен на обработку моих "
        link={LEGAL_LINKS.personalData}
      />
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
}

function ConsentRow({
  checked,
  hasError,
  errorId,
  onChange,
  prefix,
  link,
}: {
  checked: boolean;
  hasError: boolean;
  errorId: string;
  onChange: (checked: boolean) => void;
  prefix: string;
  link: { label: string; href: string };
}) {
  const id = useId();
  // Иконки чекбокса из макета (checkbox / check_box_RoundedFill) — как маска, чтобы
  // красить их в цвет состояния, не меняя сами SVG.
  const icon = checked ? "/icons/checkbox-checked.svg" : "/icons/checkbox.svg";

  return (
    <div className="flex items-center gap-4">
      <span className="relative size-6 shrink-0 rounded-[3px] has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-hoffman-black">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={hasError && !checked ? true : undefined}
          aria-describedby={hasError ? errorId : undefined}
          className="absolute inset-0 size-6 cursor-pointer opacity-0"
        />
        <span
          aria-hidden="true"
          className={`pointer-events-none block size-6 ${
            hasError && !checked ? "bg-hoffman-fire" : "bg-hoffman-black"
          }`}
          style={{ mask: `url(${icon}) center / contain no-repeat`, WebkitMask: `url(${icon}) center / contain no-repeat` }}
        />
      </span>
      <label htmlFor={id} className="text-[12px] leading-[1.15] text-hoffman-dark">
        {prefix}
        <Link href={link.href} className="font-semibold text-hoffman-cherry underline">
          {link.label}
        </Link>
      </label>
    </div>
  );
}
