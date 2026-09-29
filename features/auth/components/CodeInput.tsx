"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";

export const CODE_LENGTH = 6;

export function emptyCode(): string[] {
  return Array.from({ length: CODE_LENGTH }, () => "");
}

type CodeInputProps = {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  errorId?: string;
  disabled?: boolean;
};

/** Одноразовый код: 6 ячеек по одной цифре, автопереход, вставка целого кода. */
export function CodeInput({ value, onChange, error, errorId, disabled }: CodeInputProps) {
  const cells = useRef<(HTMLInputElement | null)[]>([]);

  function focusCell(index: number) {
    cells.current[Math.max(0, Math.min(CODE_LENGTH - 1, index))]?.focus();
  }

  /** Раскладывает цифры по ячейкам начиная с `start` (ввод, вставка, автозаполнение из SMS/почты). */
  function fill(start: number, digits: string) {
    const next = [...value];
    let index = start;
    for (const digit of digits) {
      if (index >= CODE_LENGTH) break;
      next[index++] = digit;
    }
    onChange(next);
    focusCell(index);
  }

  function handleChange(index: number, raw: string) {
    const digits = raw.replace(/\D/g, "");
    if (!digits) {
      const next = [...value];
      next[index] = "";
      onChange(next);
      return;
    }
    // В ячейке уже была цифра — берём только новую.
    fill(index, digits.length > 1 && value[index] ? digits.slice(-1) : digits);
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !value[index] && index > 0) {
      event.preventDefault();
      const next = [...value];
      next[index - 1] = "";
      onChange(next);
      focusCell(index - 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusCell(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusCell(index + 1);
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const digits = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!digits) return;
    event.preventDefault();
    fill(0, digits.slice(0, CODE_LENGTH));
  }

  return (
    <div role="group" aria-label="Код из письма" className="flex justify-between gap-2">
      {value.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            cells.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          pattern="[0-9]*"
          maxLength={CODE_LENGTH}
          aria-label={`Цифра ${index + 1} из ${CODE_LENGTH}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          autoFocus={index === 0}
          disabled={disabled}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`h-[53px] w-full min-w-0 rounded-[3px] border-[0.5px] bg-hoffman-light-blue text-center text-[17px] leading-[1.4] text-hoffman-black outline-none ${
            error ? "border-hoffman-fire" : "border-transparent focus:border-hoffman-black"
          }`}
        />
      ))}
    </div>
  );
}
