export const SECTION_HASH = {
  about: "about",
  advantages: "advantages",
  roles: "roles",
  start: "start",
  contacts: "contacts",
} as const;

export type SectionHash = (typeof SECTION_HASH)[keyof typeof SECTION_HASH];

export const mainNavItems: { label: string; hash: SectionHash }[] = [
  { label: "Про нас", hash: SECTION_HASH.about },
  { label: "Переваги", hash: SECTION_HASH.advantages },
  { label: "Ролі", hash: SECTION_HASH.roles },
  { label: "Як розпочати?", hash: SECTION_HASH.start },
  { label: "Контакти", hash: SECTION_HASH.contacts },
];

/** Футер: без «Як розпочати?» — як у макеті */
export const footerNavItems = mainNavItems.filter((i) => i.hash !== "start");
