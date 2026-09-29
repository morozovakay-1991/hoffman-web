"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authApi } from "../api";
import { AuthErrorText, commonErrorText } from "../messages";
import { validateConsents, validateEmail, validateRequiredPassword } from "../validation";
import { ConsentCheckboxes, type Consents } from "./ConsentCheckboxes";
import { AuthHeading, FormAlert, SubmitButton, TextField, linkClass } from "./ui";

type Errors = { email?: string; password?: string; consents?: string; form?: string };

export function LoginForm({ initialError }: { initialError?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consents, setConsents] = useState<Consents>({ privacy: false, personalData: false });
  const [errors, setErrors] = useState<Errors>({ form: initialError });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Errors = {
      email: validateEmail(email),
      password: validateRequiredPassword(password),
      consents: validateConsents(consents),
    };
    setErrors(next);
    if (next.email || next.password || next.consents) return;

    setLoading(true);
    const result = await authApi.login({ email: email.trim(), password });
    if (result.ok) {
      router.replace("/dashboard");
      router.refresh();
      return;
    }
    setLoading(false);

    const { error } = result;
    if (error.code === "INVALID_CREDENTIALS") {
      setErrors({ password: AuthErrorText.invalidCredentials });
    } else if (error.code === "VALIDATION_ERROR" && error.fields.email) {
      setErrors({ email: AuthErrorText.emailInvalid });
    } else {
      setErrors({ form: commonErrorText(error) });
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col">
      <AuthHeading title="Авторизация" subtitle="Пожалуйста, войдите в свой аккаунт" />
      <div className="mt-8 flex flex-col gap-8 lg:mt-16">
        <FormAlert message={errors.form} />
        <TextField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="example@gmail.com"
          value={email}
          error={errors.email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors((prev) => ({ ...prev, email: undefined }));
          }}
        />
        <TextField
          label="Пароль"
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          error={errors.password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors((prev) => ({ ...prev, password: undefined }));
          }}
        />
      </div>
      <Link href="/forgot-password" className={`mt-4 self-end ${linkClass}`}>
        Забыли пароль?
      </Link>
      <div className="mt-16">
        <SubmitButton loading={loading} ready={Boolean(email && password && consents.privacy && consents.personalData)}>
          Войти
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
