// Ссылки публичной шапки и футера (Figma: Mobile-app-UI, кадр 1228:3404).
// `href: null` — адрес ещё не известен: пункт показывается без ссылки.

export type SiteLink = { label: string; href: string | null };

export const CONTACTS = {
  email: "admin@hoffman-institut.ru",
  phone: "+7 (916) 806 66 36",
  phoneHref: "tel:+79168066636",
};

export const FOOTER_CONTACT_LINKS: SiteLink[] = [
  { label: "Связаться с нами", href: `mailto:${CONTACTS.email}` },
  { label: "Институт Хоффмана", href: "https://hoffman-institut.ru" },
  // TODO: адрес магазина не указан в макете.
  { label: "Магазин", href: null },
];

export const FOOTER_SECTION_LINKS: SiteLink[] = [
  { label: "О проекте", href: "/" },
  { label: "Личный кабинет", href: "/dashboard" },
  { label: "Тарифы", href: "/pricing" },
  // TODO: раздела FAQ на сайте пока нет.
  { label: "FAQ", href: null },
];

// Слаги — LegalDocument::SLUG_* в hoffman-backend. Страниц /legal/* на сайте пока нет.
export const LEGAL_LINKS = {
  privacy: { label: "Политика конфиденциальности", href: "/legal/privacy" },
  // TODO: публичной оферты и согласия на обработку ПДн нет среди документов backend.
  offer: { label: "Публичная оферта", href: "/legal/offer" },
  license: { label: "Лицензионное соглашение", href: "/legal/license" },
  terms: { label: "Условия использования", href: "/legal/terms" },
  personalData: { label: "персональных данных", href: "/legal/personal-data" },
} satisfies Record<string, SiteLink>;

// TODO: ссылки на приложение в сторах не указаны в макете.
export const APP_STORE_URL: string | null = null;
export const GOOGLE_PLAY_URL: string | null = null;
