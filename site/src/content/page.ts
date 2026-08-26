export const locales = ["pl", "en", "ru", "es"] as const;

export type Locale = (typeof locales)[number];

export interface PageContent {
  locale: Locale;
  title: string;
  description: string;
  languageName: string;
  heading: string;
  intro: string;
  menuLabel: string;
  bookingLabel: string;
  navigationLabel: string;
  menuUrl: string;
  bookingUrl: string;
}

const sharedLinks = {
  menuUrl: "https://qr.margariteros.bar/",
  bookingUrl: "https://margariteroswwa.choiceqr.com/booking",
} as const;

const pages: Record<Locale, Omit<PageContent, "locale">> = {
  pl: {
    title: "Margariteros",
    description: "Oficjalna strona Margariteros.",
    languageName: "Polski",
    heading: "Margariteros",
    intro: "Witamy w Margariteros.",
    menuLabel: "Zobacz menu",
    bookingLabel: "Rezerwacja",
    navigationLabel: "Wybierz język",
    ...sharedLinks,
  },
  en: {
    title: "Margariteros",
    description: "The official Margariteros website.",
    languageName: "English",
    heading: "Margariteros",
    intro: "Welcome to Margariteros.",
    menuLabel: "View menu",
    bookingLabel: "Book a table",
    navigationLabel: "Choose language",
    ...sharedLinks,
  },
  ru: {
    title: "Margariteros",
    description: "Официальный сайт Margariteros.",
    languageName: "Русский",
    heading: "Margariteros",
    intro: "Добро пожаловать в Margariteros.",
    menuLabel: "Меню",
    bookingLabel: "Забронировать",
    navigationLabel: "Выберите язык",
    ...sharedLinks,
  },
  es: {
    title: "Margariteros",
    description: "El sitio oficial de Margariteros.",
    languageName: "Español",
    heading: "Margariteros",
    intro: "Bienvenido a Margariteros.",
    menuLabel: "Ver menú",
    bookingLabel: "Reservar",
    navigationLabel: "Elige idioma",
    ...sharedLinks,
  },
};

export function getPage(locale: Locale): PageContent {
  return { locale, ...pages[locale] };
}
