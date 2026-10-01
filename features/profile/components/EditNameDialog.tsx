"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { FormAlert, SubmitButton, TextField } from "@/features/auth/components/ui";
import { validateName } from "@/features/auth/validation";
import { profileApi } from "../api";
import { ProfileText, isSessionLost, profileErrorText } from "../messages";
import { ModalActions, ProfileModal } from "./ui";
import { secondaryButtonClass } from "../styles";

/** Backend `UpdateProfileRequest`. */
const NAME_MAX_LENGTH = 255;

/**
 * «Имя пользователя» (Figma 1252:12587): `PATCH /profile`, без подтверждения кодом.
 * В макете под полем кнопки «Отменить» / «Выйти» (скопированы из модалки выхода) —
 * здесь «Сохранить» / «Отменить», как на мобильном экране 642:3475.
 */
export function EditNameDialog({ currentName, onClose, onSaved }: { currentName: string; onClose: () => void; onSaved: (message: string) => void }) {
  const router = useRouter();
  const [name, setName] = useState(currentName);
  const [error, setError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nameError = validateName(name);
    setError(nameError);
    if (nameError) return;

    setLoading(true);
    const result = await profileApi.updateName(name.trim());
    setLoading(false);
    if (result.ok) {
      router.refresh();
      onSaved(ProfileText.nameSaved);
      return;
    }
    if (isSessionLost(result.error)) router.replace("/login");
    else if (result.error.code === "VALIDATION_ERROR" && result.error.fields.name) setError(ProfileText.checkField);
    else setFormError(profileErrorText(result.error));
  }

  return (
    <ProfileModal title="Имя пользователя" onClose={onClose} busy={loading} tallTitle>
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-[54px]">
        <TextField
          label="Имя"
          hideLabel
          tone="onTint"
          name="name"
          autoComplete="name"
          autoFocus
          maxLength={NAME_MAX_LENGTH}
          value={name}
          error={error}
          onChange={(e) => {
            setName(e.target.value);
            setError(undefined);
            setFormError(undefined);
          }}
        />
        <ModalActions>
          <FormAlert message={formError} />
          <SubmitButton loading={loading}>Сохранить</SubmitButton>
          <button type="button" onClick={onClose} disabled={loading} className={secondaryButtonClass}>
            Отменить
          </button>
        </ModalActions>
      </form>
    </ProfileModal>
  );
}
