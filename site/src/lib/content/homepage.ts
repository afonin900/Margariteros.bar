import { getEmDashEntry } from "emdash";
import type { Homepage } from "../../../.emdash/types";
import type { Locale } from "../../content/page";

export type HomepageHero = {
  image: { src: string; width: number; height: number };
  eyebrow: string;
  title: string;
  text: string;
  imageAlt: string;
  primaryCta: string;
  secondaryCta: string;
  galleryHeading: string;
};

const fallback: Record<Locale, HomepageHero> = {
  pl: { image: { src: "/media/gallery/dance-floor-400.webp", width: 400, height: 400 }, eyebrow: "CHMIELNA 7/9 · WARSZAWA", title: "WYDARZENIA W CENTRUM WARSZAWY", text: "Muzyka, taniec i meksykańska kuchnia. Zobacz program i wybierz swój wieczór.", imageAlt: "Goście podczas wydarzenia w Margariteros", primaryCta: "ZAREZERWUJ STOLIK", secondaryCta: "ZOBACZ MENU", galleryHeading: "ZOBACZ, JAK JEST U NAS" },
  en: { image: { src: "/media/gallery/dance-floor-400.webp", width: 400, height: 400 }, eyebrow: "CHMIELNA 7/9 · WARSAW", title: "EVENTS IN CENTRAL WARSAW", text: "Music, dance and Mexican food. Explore the programme and choose your evening.", imageAlt: "Guests at an event at Margariteros", primaryCta: "BOOK A TABLE", secondaryCta: "VIEW MENU", galleryHeading: "SEE THE ATMOSPHERE" },
  ru: { image: { src: "/media/gallery/dance-floor-400.webp", width: 400, height: 400 }, eyebrow: "CHMIELNA 7/9 · WARSZAWA", title: "СОБЫТИЯ В ЦЕНТРЕ ВАРШАВЫ", text: "Музыка, танцы и мексиканская кухня. Посмотрите программу и выберите свой вечер.", imageAlt: "Гости на мероприятии в Margariteros", primaryCta: "ЗАБРОНИРОВАТЬ", secondaryCta: "ПОСМОТРЕТЬ МЕНЮ", galleryHeading: "ПОСМОТРЕТЬ АТМОСФЕРУ" },
  es: { image: { src: "/media/gallery/dance-floor-400.webp", width: 400, height: 400 }, eyebrow: "CHMIELNA 7/9 · VARSOVIA", title: "EVENTOS EN EL CENTRO DE VARSOVIA", text: "Música, baile y cocina mexicana. Descubre el programa y elige tu noche.", imageAlt: "Invitados en un evento de Margariteros", primaryCta: "RESERVAR MESA", secondaryCta: "VER MENÚ", galleryHeading: "DESCUBRE EL AMBIENTE" },
};

export async function getHomepageHero(locale: Locale): Promise<HomepageHero> {
  const defaults = fallback[locale];
  const { entry, error } = await getEmDashEntry<"homepage", Homepage>("homepage", "main", { locale });
  if (error || !entry || entry.data.status !== "published") return defaults;
  const data = entry.data;
  const image = data.hero_image;
  return {
    image: image.src ? { src: image.src, width: image.width ?? 1200, height: image.height ?? 800 } : defaults.image,
    eyebrow: data.hero_eyebrow?.trim() || defaults.eyebrow,
    title: data.hero_title?.trim() || defaults.title,
    text: data.hero_text?.trim() || defaults.text,
    imageAlt: data.hero_image_alt?.trim() || defaults.imageAlt,
    primaryCta: data.primary_cta_label?.trim() || defaults.primaryCta,
    secondaryCta: data.secondary_cta_label?.trim() || defaults.secondaryCta,
    galleryHeading: data.gallery_heading?.trim() || defaults.galleryHeading,
  };
}
