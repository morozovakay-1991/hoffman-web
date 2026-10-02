// Классы кнопок и строк меню кабинета (Figma 1273:5793, 1274:7564). Отдельный модуль без
// "use client": строковые константы из клиентского модуля в Server Component пришли бы
// client reference, а не строкой.

const buttonBase =
  "flex h-10 w-[212px] items-center justify-center rounded-[3px] px-4 text-[14px] leading-[1.15] font-medium tracking-[-0.56px] transition-colors disabled:opacity-60";

/** Чёрная кнопка модалки (как SubmitButton из features/auth, но не submit). */
export const primaryButtonClass = `${buttonBase} bg-hoffman-black text-hoffman-light-blue`;

/** Белая кнопка с тонкой рамкой (Figma 1274:7574). */
export const secondaryButtonClass = `${buttonBase} border-[0.5px] border-hoffman-black bg-white text-hoffman-black`;

/** Строка меню (Figma 1273:5841): 53px, текст `Text/h2` 20/28. */
export const menuRowClass =
  "group flex h-[53px] w-full items-center justify-between gap-4 rounded-[3px] p-[10px] text-left text-[20px] leading-[28px] text-hoffman-black";
