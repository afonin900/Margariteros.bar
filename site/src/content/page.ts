export const locales = ["pl", "en", "ru", "es"] as const;

export type Locale = (typeof locales)[number];

export interface OpeningHour {
  day: string;
  hours: string;
}

export interface GalleryItem {
  src: string;
  srcSetWebp: string;
  srcSetAvif: string;
  alt: string;
  width: number;
  height: number;
}

export interface PageContent {
  locale: Locale;
  title: string;
  description: string;
  languageName: string;
  languageCode: string;
  heading: string;
  tagline: string;
  homeLabel: string;
  menuLabel: string;
  bookingLabel: string;
  clubLabel: string;
  contactLabel: string;
  navigationLabel: string;
  addressLabel: string;
  phoneLabel: string;
  mapLabel: string;
  callLabel: string;
  galleryHeading: string;
  galleryAltDance: string;
  galleryAltMusic: string;
  galleryAltInterior: string;
  galleryAltFood: string;
  galleryAltTerrace: string;
  galleryItems: readonly GalleryItem[];
  contactHeading: string;
  hoursHeading: string;
  socialsHeading: string;
  mapHeading: string;
  directionsLabel: string;
  hours: readonly OpeningHour[];
  address: string;
  phoneDisplay: string;
  phoneUrl: string;
  menuUrl: string;
  bookingUrl: string;
  mapUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  facebookUrl: string;
}

const sharedFacts = {
  address: "Chmielna 7/9, 00-021 Warszawa, Poland",
  phoneDisplay: "+48 728 805 628",
  phoneUrl: "tel:+48728805628",
  menuUrl: "https://qr.margariteros.bar/",
  bookingUrl: "https://margariteroswwa.choiceqr.com/booking",
  mapUrl: "https://maps.google.com/?q=Chmielna%207%2F9%2C%2000-021%20Warszawa%2C%20Poland",
  instagramUrl: "https://www.instagram.com/margariteros.bar",
  tiktokUrl: "https://www.tiktok.com/@margariteros.bar",
  facebookUrl: "https://www.facebook.com/profile.php?id=61576663994634",
} as const;

type LocalizedPage = Omit<PageContent, "locale" | "galleryItems">;

const pages: Record<Locale, LocalizedPage> = {
  pl: {
    title: "Margariteros — kuchnia, taniec i atmosfera w centrum Warszawy",
    description: "Poznaj Margariteros przy Chmielnej: kuchnia, taniec, wnętrze, menu i rezerwacja stolika.",
    languageName: "Polski",
    languageCode: "PL",
    heading: "Margariteros",
    tagline: "Kuchnia, taniec i dobra energia",
    homeLabel: "Strona główna",
    menuLabel: "Zobacz menu",
    bookingLabel: "Rezerwacja",
    clubLabel: "R Club",
    contactLabel: "Kontakt",
    navigationLabel: "Nawigacja i wybór języka",
    addressLabel: "Adres",
    phoneLabel: "Telefon",
    mapLabel: "Pokaż na mapie",
    callLabel: "Zadzwoń",
    galleryHeading: "Nasze zdjęcia",
    galleryAltDance: "Goście tańczą we wnętrzu Margariteros",
    galleryAltMusic: "Muzyka na żywo w Margariteros",
    galleryAltInterior: "Wnętrze Margariteros",
    galleryAltFood: "Dania podane w Margariteros",
    galleryAltTerrace: "Taras Margariteros przy Chmielnej",
    contactHeading: "Dane kontaktowe",
    hoursHeading: "Godziny pracy",
    socialsHeading: "Znajdź nas",
    mapHeading: "Na mapie",
    directionsLabel: "Dowiedz się, jak dojechać",
    hours: [
      { day: "Poniedziałek", hours: "Zamknięte" },
      { day: "Wtorek", hours: "17:00–23:00" },
      { day: "Środa", hours: "17:00–23:00" },
      { day: "Czwartek", hours: "17:00–23:00" },
      { day: "Piątek", hours: "15:00–02:00" },
      { day: "Sobota", hours: "13:00–02:00" },
      { day: "Niedziela", hours: "13:00–21:00" },
    ],
    ...sharedFacts,
  },
  en: {
    title: "Margariteros — food, dance and atmosphere in central Warsaw",
    description: "Discover Margariteros on Chmielna: food, dance, interiors, the menu and table booking.",
    languageName: "English",
    languageCode: "EN",
    heading: "Margariteros",
    tagline: "Food, dance and good energy",
    homeLabel: "Home",
    menuLabel: "View menu",
    bookingLabel: "Book a table",
    clubLabel: "R Club",
    contactLabel: "Contact",
    navigationLabel: "Navigation and language selection",
    addressLabel: "Address",
    phoneLabel: "Phone",
    mapLabel: "Show on map",
    callLabel: "Call us",
    galleryHeading: "Our photos",
    galleryAltDance: "Guests dancing inside Margariteros",
    galleryAltMusic: "Live music at Margariteros",
    galleryAltInterior: "The interior of Margariteros",
    galleryAltFood: "Food served at Margariteros",
    galleryAltTerrace: "The Margariteros terrace on Chmielna",
    contactHeading: "Contact details",
    hoursHeading: "Opening hours",
    socialsHeading: "Find us",
    mapHeading: "Map",
    directionsLabel: "Get directions",
    hours: [
      { day: "Monday", hours: "Closed" },
      { day: "Tuesday", hours: "17:00–23:00" },
      { day: "Wednesday", hours: "17:00–23:00" },
      { day: "Thursday", hours: "17:00–23:00" },
      { day: "Friday", hours: "15:00–02:00" },
      { day: "Saturday", hours: "13:00–02:00" },
      { day: "Sunday", hours: "13:00–21:00" },
    ],
    ...sharedFacts,
  },
  ru: {
    title: "Margariteros — кухня, танцы и атмосфера в центре Варшавы",
    description: "Познакомьтесь с Margariteros на Хмельной: кухня, танцы, интерьер, меню и бронирование столика.",
    languageName: "Русский",
    languageCode: "RU",
    heading: "Margariteros",
    tagline: "Кухня, танцы и хорошая энергия",
    homeLabel: "Главная",
    menuLabel: "Посмотреть меню",
    bookingLabel: "Забронировать",
    clubLabel: "R Club",
    contactLabel: "Контакты",
    navigationLabel: "Навигация и выбор языка",
    addressLabel: "Адрес",
    phoneLabel: "Телефон",
    mapLabel: "Показать на карте",
    callLabel: "Позвонить",
    galleryHeading: "Наши фотографии",
    galleryAltDance: "Гости танцуют в Margariteros",
    galleryAltMusic: "Живая музыка в Margariteros",
    galleryAltInterior: "Интерьер Margariteros",
    galleryAltFood: "Блюда в Margariteros",
    galleryAltTerrace: "Терраса Margariteros на Хмельной",
    contactHeading: "Контактные данные",
    hoursHeading: "Часы работы",
    socialsHeading: "Мы в сети",
    mapHeading: "На карте",
    directionsLabel: "Построить маршрут",
    hours: [
      { day: "Понедельник", hours: "Закрыто" },
      { day: "Вторник", hours: "17:00–23:00" },
      { day: "Среда", hours: "17:00–23:00" },
      { day: "Четверг", hours: "17:00–23:00" },
      { day: "Пятница", hours: "15:00–02:00" },
      { day: "Суббота", hours: "13:00–02:00" },
      { day: "Воскресенье", hours: "13:00–21:00" },
    ],
    ...sharedFacts,
  },
  es: {
    title: "Margariteros — cocina, baile y ambiente en el centro de Varsovia",
    description: "Descubre Margariteros en Chmielna: cocina, baile, interior, menú y reserva de mesa.",
    languageName: "Español",
    languageCode: "ES",
    heading: "Margariteros",
    tagline: "Cocina, baile y buena energía",
    homeLabel: "Inicio",
    menuLabel: "Ver menú",
    bookingLabel: "Reservar",
    clubLabel: "R Club",
    contactLabel: "Contacto",
    navigationLabel: "Navegación y selección de idioma",
    addressLabel: "Dirección",
    phoneLabel: "Teléfono",
    mapLabel: "Ver en el mapa",
    callLabel: "Llamar",
    galleryHeading: "Nuestras fotos",
    galleryAltDance: "Personas bailando dentro de Margariteros",
    galleryAltMusic: "Música en vivo en Margariteros",
    galleryAltInterior: "El interior de Margariteros",
    galleryAltFood: "Platos servidos en Margariteros",
    galleryAltTerrace: "La terraza de Margariteros en Chmielna",
    contactHeading: "Datos de contacto",
    hoursHeading: "Horario",
    socialsHeading: "Encuéntranos",
    mapHeading: "Mapa",
    directionsLabel: "Cómo llegar",
    hours: [
      { day: "Lunes", hours: "Cerrado" },
      { day: "Martes", hours: "17:00–23:00" },
      { day: "Miércoles", hours: "17:00–23:00" },
      { day: "Jueves", hours: "17:00–23:00" },
      { day: "Viernes", hours: "15:00–02:00" },
      { day: "Sábado", hours: "13:00–02:00" },
      { day: "Domingo", hours: "13:00–21:00" },
    ],
    ...sharedFacts,
  },
};

export function getPage(locale: Locale): PageContent {
  const page = pages[locale];
  const media = [
    ["dance-floor", page.galleryAltDance],
    ["live-music", page.galleryAltMusic],
    ["food-tacos-wall", page.galleryAltFood],
    ["terrace", page.galleryAltTerrace],
    ["interior-seating", page.galleryAltInterior],
    ["food-tacos-wall", page.galleryAltFood],
    ["interior-wall", page.galleryAltInterior],
    ["dance-floor", page.galleryAltDance],
    ["food-tacos-wall", page.galleryAltFood],
    ["interior-seating", page.galleryAltInterior],
    ["live-music", page.galleryAltMusic],
    ["interior-wall", page.galleryAltInterior],
    ["terrace", page.galleryAltTerrace],
    ["dance-floor", page.galleryAltDance],
    ["interior-wall", page.galleryAltInterior],
    ["food-tacos-wall", page.galleryAltFood],
    ["live-music", page.galleryAltMusic],
    ["terrace", page.galleryAltTerrace],
    ["food-tacos-wall", page.galleryAltFood],
    ["interior-seating", page.galleryAltInterior],
  ] as const;

  const galleryItems = media.map(([name, alt]) => ({
    src: `/media/gallery/${name}-400.webp`,
    srcSetWebp: `/media/gallery/${name}-200.webp 200w, /media/gallery/${name}-400.webp 400w`,
    srcSetAvif: `/media/gallery/${name}-200.avif 200w, /media/gallery/${name}-400.avif 400w`,
    alt,
    width: 400,
    height: 400,
  }));

  return { locale, ...page, galleryItems };
}
