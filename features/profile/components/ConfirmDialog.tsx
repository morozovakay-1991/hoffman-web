"use client";

import type { ReactNode } from "react";
import { FormAlert } from "@/features/auth/components/ui";
import { ModalActions, ProfileModal } from "./ui";
import { primaryButtonClass, secondaryButtonClass } from "../styles";

type Props = {
  /** «Выйти из аккаунта?» / «Данные будут удалены безвозвратно». */
  message: string;
  confirmLabel: string;
  onCancel: () => void;
  /** Без `onConfirm` подтверждением служит `confirmControl` (например, submit формы выхода). */
  onConfirm?: () => void;
  confirmControl?: ReactNode;
  onBack?: () => void;
  loading?: boolean;
  error?: string;
};

/**
 * «Вы уверены?» (Figma 1274:7564 — удаление, 1273:7472 — выход): безопасное
 * действие «Отменить» — главная чёрная кнопка, подтверждение — белая под ней.
 */
export function ConfirmDialog({ message, confirmLabel, onCancel, onConfirm, confirmControl, onBack, loading = false, error }: Props) {
  return (
    <ProfileModal title="Вы уверены?" subtitle={message} onClose={onCancel} onBack={onBack} busy={loading}>
      <ModalActions>
        <FormAlert message={error} />
        <button type="button" onClick={onCancel} disabled={loading} className={primaryButtonClass} autoFocus>
          Отменить
        </button>
        {confirmControl ?? (
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            aria-busy={loading || undefined}
            className={secondaryButtonClass}
          >
            {confirmLabel}
          </button>
        )}
      </ModalActions>
    </ProfileModal>
  );
}
