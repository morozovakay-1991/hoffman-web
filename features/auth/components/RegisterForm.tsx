"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authApi, isEmailTaken } from "../api";
import { AuthErrorText, commonErrorText } from "../messages";
import {
  validateConsents,
  validateEmail,
  validateName,
  validateNewPassword,
  validatePasswordConfirmation,
} from "../validation";
import { ConsentCheckboxes, type Consents } from "./ConsentCheckboxes";
import { AuthHeading, FormAlert, PasswordRequirements, SubmitButton, TextField } from "./ui";

type Field = "name" | "email" | "password" | "confirmation";
type Errors = Partial<Record<Field | "consents" | "form", string>>;

// Макет содержит только Email и Пароль. «Имя» добавлено, потому что backend
// требует `name`, «Повторите пароль» — как в мобильном приложении.
export function RegisterForm({ initialError }: { initialError?: string }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<Field, string>>({
    name: "",
    email: "",
    password: "",
    confirmation: "",
  });
  const [consents, setConsents] = useState<Consents>({ privacy: false, personalData: false });
  const [errors, setErrors] = useState<Errors>({ form: initialError });
  const [loading, setLoading] = useState(false);

  function update(field: Field, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const passwordError = validateNewPassword(values.password);
    const next: Errors = {
      name: validateName(values.name),
      email: validateEmail(values.email),
      password: passwordError,
      confirmation: passwordError
        ? undefined
        : validatePasswordConfirmation(values.password, values.confirmation),
      consents: validateConsents(consents),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setLoading(true);
    const result = await authApi.register({
      name: values.name.trim(),
      email: values.email.trim(),
      password: values.password,
      password_confirmation: values.confirmation,
    });
    if (result.ok) {
      router.replace("/dashboard");
      router.refresh();
      return;
    }
    setLoading(false);

    const { error } = result;
    if (isEmailTaken(error)) {
      setErrors({ email: AuthErrorText.emailTaken });
    } else if (error.code === "VALIDATION_ERROR") {
      setErrors({
        name: error.fields.name ? AuthErrorText.nameRequired : undefined,
        email: error.fields.email ? AuthErrorText.emailInvalid : undefined,
        password: error.fields.password ? AuthErrorText.passwordFormat : undefined,
        form: Object.keys(error.fields).length ? undefined : AuthErrorText.unknown,
      });
    } else {
      setErrors({ form: commonErrorText(error) });
    }
  }

  const ready =
    Object.values(values).every(Boolean) && consents.privacy && consents.personalData;

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col">
      <AuthHeading title="Регистрация" subtitle="Создайте аккаунт" />
      <div className="mt-8 flex flex-col gap-8 lg:mt-16">
        <FormAlert message={errors.form} />
        <TextField
          label="Имя"
          name="name"
          autoComplete="name"
          value={values.name}
          error={errors.name}
          onChange={(e) => update("name", e.target.value)}
        />
        <TextField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="example@gmail.com"
          value={values.email}
          error={errors.email}
          onChange={(e) => update("email", e.target.value)}
        />
        <TextField
          label="Пароль"
          type="password"
          name="password"
          autoComplete="new-password"
          value={values.password}
          error={errors.password}
          hint={<PasswordRequirements password={values.password} />}
          onChange={(e) => update("password", e.target.value)}
        />
        <TextField
          label="Повторите пароль"
          type="password"
          name="password_confirmation"
          autoComplete="new-password"
          value={values.confirmation}
          error={errors.confirmation}
          onChange={(e) => update("confirmation", e.target.value)}
        />
      </div>
      <div className="mt-16">
        <SubmitButton loading={loading} ready={ready}>
          Зарегистрироваться
        </SubmitButton>
      </div>
      <div className="mt-4">
        <ConsentCheckboxes
          value={consents}
          error={errors.consents}
          onChange={(value) => {
            setConsents(value);
            setErrors((prev) => ({ ...prev, consents: undefined }));
          }}
        />
      </div>
    </form>
  );
}
