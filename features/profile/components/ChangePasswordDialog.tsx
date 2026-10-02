"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { FormAlert, SubmitButton, TextField } from "@/features/auth/components/ui";
import { AuthErrorText } from "@/features/auth/messages";
import {
  validateNewPassword,
  validatePasswordConfirmation,
  validateRequiredPassword,
} from "@/features/auth/validation";
import { profileApi } from "../api";
import { ProfileText, isSessionLost, profileErrorText } from "../messages";
import { ProfileModal } from "./ui";

type Field = "old" | "password" | "confirmation";
type Errors = Partial<Record<Field | "form", string>>;

/**
 * «Пароль» (Figma 1254:12892): старый + новый пароль, `PATCH /profile/password`.
 * Повтор нового пароля backend не принимает — он проверяется здесь. Третье поле
 * в макете тоже подписано «Новый пароль»; подпись — как в мобильном (642:3533).
 */
export function ChangePasswordDialog({ onClose, onSaved }: { onClose: () => void; onSaved: (message: string) => void }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<Field, string>>({ old: "", password: "", confirmation: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  function update(field: Field, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, form: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const passwordError = validateNewPassword(values.password);
    const next: Errors = {
      old: validateRequiredPassword(values.old),
      password: passwordError,
      confirmation: passwordError ? undefined : validatePasswordConfirmation(values.password, values.confirmation),
    };
    setErrors(next);
    if (next.old || next.password || next.confirmation) return;

    setLoading(true);
    const result = await profileApi.updatePassword({ old_password: values.old, password: values.password });
    setLoading(false);
    if (result.ok) {
      onSaved(ProfileText.passwordChanged);
      return;
    }
    const { error } = result;
    if (isSessionLost(error)) router.replace("/login");
    else if (error.code === "INVALID_OLD_PASSWORD") setErrors({ old: ProfileText.invalidOldPassword });
    else if (error.code === "VALIDATION_ERROR" && error.fields.password) setErrors({ password: AuthErrorText.passwordFormat });
    else if (error.code === "VALIDATION_ERROR" && error.fields.old_password) setErrors({ old: AuthErrorText.passwordRequired });
    else setErrors({ form: profileErrorText(error) });
  }

  return (
    <ProfileModal title="Пароль" onClose={onClose} busy={loading}>
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-[54px]">
        <div className="flex flex-col gap-[54px]">
          <TextField
            label="Старый пароль"
            tone="onTint"
            type="password"
            name="old_password"
            autoComplete="current-password"
            autoFocus
            value={values.old}
            error={errors.old}
            onChange={(e) => update("old", e.target.value)}
          />
          <TextField
            label="Новый пароль"
            tone="onTint"
            type="password"
            name="password"
            autoComplete="new-password"
            value={values.password}
            error={errors.password}
            onChange={(e) => update("password", e.target.value)}
          />
          <TextField
            label="Повторите новый пароль"
            tone="onTint"
            type="password"
            name="password_confirmation"
            autoComplete="new-password"
            value={values.confirmation}
            error={errors.confirmation}
            onChange={(e) => update("confirmation", e.target.value)}
          />
        </div>
        <div className="flex flex-col items-start gap-4">
          <FormAlert message={errors.form} />
          <SubmitButton loading={loading}>Сохранить</SubmitButton>
        </div>
      </form>
    </ProfileModal>
  );
}
