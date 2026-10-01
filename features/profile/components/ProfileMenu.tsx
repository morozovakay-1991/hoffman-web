"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./LogoutButton";
import { ArrowIcon } from "./ui";
import { menuRowClass } from "../styles";

// `href: null` — раздела на сайте пока нет: пункт из макета показывается без ссылки
// (как ссылки с неизвестным адресом в lib/site.ts).
type MenuItem = { label: string; href: string | null; matches?: (pathname: string) => boolean };

export const PROFILE_MENU: MenuItem[] = [
  {
    label: "Личные данные",
    href: "/dashboard",
    matches: (p) => p === "/dashboard" || p.startsWith("/dashboard/delete-account"),
  },
  // TODO: управление подпиской на сайте — отдельный этап (чекаут, docs/plan.md, Этап 28).
  { label: "Подписка", href: null },
  // TODO: PATCH /profile/notifications есть на backend, экрана на сайте пока нет.
  { label: "Уведомления", href: null },
  { label: "Правовая информация", href: "/dashboard/legal", matches: (p) => p.startsWith("/dashboard/legal") },
];

/** Меню кабинета (Figma 1273:5840): активный пункт — light-blue со стрелкой. */
export function ProfileMenu() {
  const pathname = usePathname();

  return (
    <nav aria-label="Личный кабинет">
      <ul className="flex flex-col gap-8">
        {PROFILE_MENU.map((item) => {
          if (item.href === null) {
            return (
              <li key={item.label} className={menuRowClass}>
                {item.label}
              </li>
            );
          }
          const active = item.matches?.(pathname) ?? pathname === item.href;
          return (
            <li key={item.label}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`${menuRowClass} ${active ? "bg-hoffman-light-blue" : "hover:bg-hoffman-light-blue"}`}
              >
                {item.label}
                <ArrowIcon className={active ? "" : "invisible group-hover:visible"} />
              </Link>
            </li>
          );
        })}
        <li>
          <LogoutButton variant="menu" />
        </li>
      </ul>
    </nav>
  );
}
