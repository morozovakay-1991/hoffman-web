"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ConsentCheckboxes, type Consents } from "@/features/auth/components/ConsentCheckboxes";
import { FormAlert, SubmitButton, TextField } from "@/features/auth/components/ui";
import { validateConsents, validateName } from "@/features/auth/validation";
import { CONTACTS } from "@/lib/site";
import { profileApi } from "../api";
import { ProfileText, isSessionLost, profileErrorText } from "../messages";
import type { VerificationRequest } from "../types";
import { ModalActions, ProfileModal } from "./ui";
import { primaryButtonClass, secondaryButtonClass } from "../styles";

type Field = "last_name" | "first_name" | "phone";
type Errors = Partial<Record<Field | "consents" | "form", string>>;
type Step = "form" | "confirmed" | "not-confirmed";

/** Backend `SubmitVerificationRequest`. */
const MAX_LENGTH: Record<Field, number> = { last_name: 255, first_name: 255, phone: 32 };

function validate(values: Record<Field, string>, consents: Consents): Errors {
  return {
    last_name: values.last_name.trim() ? undefined : ProfileText.lastNameRequired,
    first_name: validateName(values.first_name),
    phone: values.phone.trim() ? undefined : ProfileText.phoneRequired,
    consents: validateConsents(consents),
  };
}

/**
 * Верификация выпускника на сайте. Веб-макета этих шагов нет — поля, тексты и
 * результаты те же, что в мобильном приложении (Figma 139:5303 / 139:5307 /
 * 139:5306), оформление — модалкой кабинета.
 *
 * `POST /verification/submit` сразу сверяет данные с базой выпускников:
 * `confirmed` — статус подтверждён, иначе заявка ждёт ручной проверки.
 */
export function VerificationDialog({ previousRequest, onClose }: { previousRequest: VerificationRequest | null; onClose: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [values, setValues] = useState<Record<Field, string>>({
    last_name: previousRequest?.last_name ?? "",
    first_name: previousRequest?.first_name ?? "",
    phone: previousRequest?.phone ?? "",
  });
  const [consents, setConsents] = useState<Consents>({ privacy: false, personalData: false });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  function update(field: Field, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, form: undefined }));
  }

  function close() {
    // Подтверждённый статус меняет блок выпускника — перечитываем профиль.
    if (step === "confirmed") router.refresh();
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate(values, consents);
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setLoading(true);
    const result = await profileApi.submitVerification({
      last_name: values.last_name.trim(),
      first_name: values.first_name.trim(),
      phone: values.phone.trim(),
    });
    setLoading(false);

    if (result.ok) {
      setStep(result.data.verification_request.status === "confirmed" ? "confirmed" : "not-confirmed");
      return;
    }
    const { error } = result;
    if (isSessionLost(error)) {
      router.replace("/login");
    } else if (error.code === "VALIDATION_ERROR") {
      setErrors({
        last_name: error.fields.last_name && ProfileText.checkField,
        first_name: error.fields.first_name && ProfileText.checkField,
        phone: error.fields.phone && ProfileText.checkField,
      });
    } else {
      setErrors({ form: profileErrorText(error) });
    }
  }

  if (step === "confirmed") {
    return (
      <ProfileModal
        title="Статус подтвержден"
        subtitle="Теперь вы имеете доступ к расширенному функционалу приложения"
        onClose={close}
      >
        <ModalActions>
          <button type="button" onClick={close} className={primaryButtonClass} autoFocus>
            Готово
          </button>
        </ModalActions>
      </ProfileModal>
    );
  }

  if (step === "not-confirmed") {
    return (
      <ProfileModal
        title="Статус не подтвержден"
        subtitle="Проверьте введенные данные и попробуйте снова или свяжитесь с администратором"
        onClose={close}
      >
        <ModalActions>
          <button type="button" onClick={() => setStep("form")} className={primaryButtonClass} autoFocus>
            Попробовать снова
          </button>
          <a href={`mailto:${CONTACTS.email}`} className={secondaryButtonClass}>
            Написать администратору
          </a>
        </ModalActions>
      </ProfileModal>
    );
  }

  return (
    <ProfileModal
      title="Данные выпускника"
      subtitle="Пожалуйста, заполните информацию для подтверждения прохождения Процесса."
      onClose={close}
      busy={loading}
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-8">
        <FormAlert message={errors.form} />
        <TextField
          label="Фамилия"
          name="last_name"
          autoComplete="family-name"
          autoFocus
          tone="onTint"
          maxLength={MAX_LENGTH.last_name}
          value={values.last_name}
          error={errors.last_name}
          onChange={(e) => update("last_name", e.target.value)}
        />
        <TextField
          label="Имя"
          name="first_name"
          autoComplete="given-name"
          tone="onTint"
          maxLength={MAX_LENGTH.first_name}
          value={values.first_name}
          error={errors.first_name}
          onChange={(e) => update("first_name", e.target.value)}
        />
        <TextField
          label="Номер телефона"
          name="phone"
          type="tel"
          autoComplete="tel"
          tone="onTint"
          maxLength={MAX_LENGTH.phone}
          value={values.phone}
          error={errors.phone}
          hint="Введите номер телефона, который указывали при прохождении Процесса Хоффмана"
          onChange={(e) => update("phone", e.target.value)}
        />
        <SubmitButton loading={loading}>Далее</SubmitButton>
        <ConsentCheckboxes
          value={consents}
          error={errors.consents}
          onChange={(value) => {
            setConsents(value);
            setErrors((prev) => ({ ...prev, consents: undefined }));
          }}
        />
      </form>
    </ProfileModal>
  );
}
