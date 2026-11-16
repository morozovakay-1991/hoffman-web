// Отдельный модуль без "use client": строка из клиентского модуля в Server Component
// пришла бы client reference, а не строкой (как features/profile/styles.ts).

/** Строка бургер-меню — как строки меню кабинета (Figma 1273:5841): 53px, текст 20/28. */
export const mobileMenuRowClass =
  "flex min-h-[3.3125rem] w-full items-center justify-between gap-4 rounded-[3px] p-[10px] text-left text-[1.25rem] leading-[1.75rem] text-hoffman-black hover:bg-hoffman-light-blue aria-[current=page]:bg-hoffman-light-blue";
