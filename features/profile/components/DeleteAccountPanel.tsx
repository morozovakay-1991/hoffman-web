"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LEGAL_LINKS } from "@/lib/site";
import { profileApi } from "../api";
import { ProfileText, isSessionLost, profileErrorText } from "../messages";
import { ConfirmDialog } from "./ConfirmDialog";
import { StatusMessage } from "./ui";
import { primaryButtonClass, secondaryButtonClass } from "../styles";

export const DELETE_NOW_MESSAGE = "Данные будут удалены безвозвратно";
export const DELETE_LATER_MESSAGE = "Аккаунт и данные будут удалены через 30 дней";

type Pending = "later" | "now" | null;

/**
 * «Удаление аккаунта и данных» — оба пути backend:
 * - «Запросить удаление данных» → `POST /profile/deletion-request`: удаление через
 *   30 дней (ProfileService::DELETION_GRACE_PERIOD_DAYS), сессия остаётся;
 * - «Удалить аккаунт» → «Вы уверены? Данные будут удалены безвозвратно»
 *   (Figma 1273:7235) → `DELETE /profile`: сразу, токены отозваны → «Ваш аккаунт удален».
 *
 * Веб-макета самого раздела нет (в 1273:7235 только модалка) — тексты и кнопки
 * как на мобильном экране 755:3939; предупреждение для отложенного пути
 * оформлено той же модалкой.
 */
export function DeleteAccountPanel() {
  const router = useRouter();
  const [confirming, setConfirming] = useState<Pending>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<string>();

  function ask(pending: Pending) {
    setError(undefined);
    setStatus(undefined);
    setConfirming(pending);
  }

  async function requestDeletion() {
    setLoading(true);
    const result = await profileApi.requestDeletion();
    setLoading(false);
    if (result.ok) {
      setConfirming(null);
      setStatus(ProfileText.deletionRequested);
      return;
    }
    if (isSessionLost(result.error)) {
      router.replace("/login");
    } else if (result.error.code === "DELETION_ALREADY_REQUESTED") {
      setConfirming(null);
      setStatus(ProfileText.deletionAlreadyRequested);
    } else {
      setError(profileErrorText(result.error));
    }
  }

  async function deleteNow() {
    setLoading(true);
    const result = await profileApi.deleteAccount();
    if (result.ok) {
      // BFF уже удалил cookie сессии; модалку не закрываем до перехода.
      router.replace("/account-deleted");
      return;
    }
    setLoading(false);
    if (isSessionLost(result.error)) router.replace("/login");
    else setError(profileErrorText(result.error));
  }

  return (
    <>
      <p className="max-w-[420px] text-[13px] leading-[18px] font-medium">
        Мы удалим ваш аккаунт и связанные данные. Некоторые данные могут храниться дольше по закону. Процесс может
        занять до 30 дней.
      </p>
      <div className="mt-[60px] flex flex-col items-start gap-4">
        <StatusMessage message={status} />
        <button type="button" onClick={() => ask("later")} className={`${primaryButtonClass} w-[232px]`}>
          Запросить удаление данных
        </button>
        <button type="button" onClick={() => ask("now")} className={`${secondaryButtonClass} w-[232px]`}>
          Удалить аккаунт
        </button>
        <Link href={LEGAL_LINKS.privacy.href} className="text-[12px] leading-[1.15] font-semibold text-hoffman-cherry underline">
          Политика конфиденциальности
        </Link>
      </div>

      {confirming === "later" && (
        <ConfirmDialog
          message={DELETE_LATER_MESSAGE}
          confirmLabel="Запросить удаление"
          onCancel={() => setConfirming(null)}
          onConfirm={requestDeletion}
          loading={loading}
          error={error}
        />
      )}
      {confirming === "now" && (
        <ConfirmDialog
          message={DELETE_NOW_MESSAGE}
          confirmLabel="Удалить аккаунт"
          onCancel={() => setConfirming(null)}
          onConfirm={deleteNow}
          loading={loading}
          error={error}
        />
      )}
    </>
  );
}
