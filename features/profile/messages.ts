import { commonErrorText } from "@/features/auth/messages";
import type { ApiError } from "@/features/auth/types";

// Тексты — те же, что в мобильном приложении
// (hoffman-mobile/lib/features/profile/presentation/widgets/profile_widgets.dart, ProfileText).
export const ProfileText = {
  nameSaved: "Имя сохранено",
  emailChanged: "Email изменен",
  passwordChanged: "Пароль изменен",
  sameEmail: "Это ваш текущий email",
  invalidOldPassword: "Неверный пароль",
  checkField: "Проверьте введенные данные",
  deletionRequested: "Запрос отправлен. Данные будут удалены в течение 30 дней",
  deletionAlreadyRequested: "Запрос на удаление данных уже отправлен",
  lastNameRequired: "Заполните фамилию",
  phoneRequired: "Заполните номер телефона",
} as const;

/** Сессия закончилась (токен отозван на другом устройстве) — BFF уже удалил cookie. */
export function isSessionLost(error: ApiError): boolean {
  return error.status === 401;
}

/** Ошибка, которую экран не разбирает отдельно: сеть, 429, блокировка, прочее. */
export const profileErrorText = commonErrorText;
