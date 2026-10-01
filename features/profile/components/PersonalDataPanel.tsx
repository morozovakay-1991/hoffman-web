"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { Profile } from "../types";
import { ChangeEmailDialog } from "./ChangeEmailDialog";
import { ChangePasswordDialog } from "./ChangePasswordDialog";
import { EditNameDialog } from "./EditNameDialog";
import { ArrowIcon, StatusMessage } from "./ui";
import { menuRowClass } from "../styles";

type Dialog = "name" | "email" | "password" | null;

const rowClass = `${menuRowClass} hover:bg-white focus-visible:bg-white`;

/**
 * «Личные данные» (Figma 1252:12648). Строки открывают модалки имени, email и
 * пароля; «Удаление аккаунта и данных» — отдельный раздел. Текущие имя и email
 * показаны справа в строках (в макете их нет, но профиль должен их показывать).
 */
export function PersonalDataPanel({ profile }: { profile: Pick<Profile, "name" | "email"> }) {
  const [dialog, setDialog] = useState<Dialog>(null);
  const [status, setStatus] = useState<string>();

  function open(next: Dialog) {
    setStatus(undefined);
    setDialog(next);
  }

  function saved(message: string) {
    setDialog(null);
    setStatus(message);
  }

  return (
    <div className="relative">
      {/* В 73px между заголовком панели и списком, чтобы список не сдвигался. */}
      <StatusMessage message={status} className="absolute -top-12 left-[10px]" />
      <ul className="flex flex-col gap-8">
        <li>
          <button type="button" className={rowClass} onClick={() => open("name")}>
            <RowContent label="Имя пользователя" value={profile.name} />
          </button>
        </li>
        <li>
          <button type="button" className={rowClass} onClick={() => open("email")}>
            <RowContent label="Email" value={profile.email ?? undefined} />
          </button>
        </li>
        <li>
          <button type="button" className={rowClass} onClick={() => open("password")}>
            <RowContent label="Пароль" />
          </button>
        </li>
        <li>
          <Link href="/dashboard/delete-account" className={rowClass}>
            <RowContent label="Удаление аккаунта и данных" />
          </Link>
        </li>
      </ul>

      {dialog === "name" && <EditNameDialog currentName={profile.name} onClose={() => setDialog(null)} onSaved={saved} />}
      {dialog === "email" && (
        <ChangeEmailDialog currentEmail={profile.email} onClose={() => setDialog(null)} onSaved={saved} />
      )}
      {dialog === "password" && <ChangePasswordDialog onClose={() => setDialog(null)} onSaved={saved} />}
    </div>
  );
}

function RowContent({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <>
      <span className="shrink-0">{label}</span>
      <span className="flex min-w-0 items-center gap-4">
        {value && <span className="truncate text-[14px] leading-[1.5] text-hoffman-soft-black">{value}</span>}
        <ArrowIcon className="invisible group-hover:visible group-focus-visible:visible" />
      </span>
    </>
  );
}
