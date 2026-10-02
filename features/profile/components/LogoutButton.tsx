"use client";

import { useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import { secondaryButtonClass, menuRowClass } from "../styles";

export const LOGOUT_MESSAGE = "Выйти из аккаунта?";

/**
 * «Выйти» в шапке и в меню кабинета: сначала подтверждение (Figma 1273:7394),
 * затем POST /api/auth/logout — он отзывает токен в Laravel и удаляет cookie.
 */
export function LogoutButton({ variant }: { variant: "header" | "menu" }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {variant === "header" ? (
        <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-2">
          Выйти
          {/* eslint-disable-next-line @next/next/no-img-element -- иконка SVG из макета (login_RoundedFill) */}
          <img src="/icons/login-icon.svg" alt="" width={24} height={24} />
        </button>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className={`${menuRowClass} hover:bg-hoffman-light-blue`}>
          Выйти
        </button>
      )}
      {open && (
        <ConfirmDialog
          message={LOGOUT_MESSAGE}
          confirmLabel="Выйти"
          onCancel={() => setOpen(false)}
          onBack={() => setOpen(false)}
          confirmControl={
            <form action="/api/auth/logout" method="post">
              <button type="submit" className={secondaryButtonClass}>
                Выйти
              </button>
            </form>
          }
        />
      )}
    </>
  );
}
