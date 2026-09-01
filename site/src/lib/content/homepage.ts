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

const textKeys = ["hero_eyebrow", "hero_title", "hero_text", "hero_image_alt", "primary_cta_label", "secondary_cta_label", "gallery_heading"] as const;

export async function getHomepageHero(locale: Locale): Promise<HomepageHero> {
  const defaults = fallback[locale];
  const { entry, error } = await getEmDashEntry<"homepage", Homepage>("homepage", "main");
  if (error || !entry || entry.data.status !== "published" || !entry.data.published_locales.includes(locale)) return defaults;
  const data = entry.data;
  const values = Object.fromEntries(textKeys.map((key) => [key, data[`${key}_${locale}` as keyof Homepage]])) as Record<(typeof textKeys)[number], unknown>;
  const image = data.hero_image;
  return {
    image: image.src ? { src: image.src, width: image.width ?? 1200, height: image.height ?? 800 } : defaults.image,
    eyebrow: typeof values.hero_eyebrow === "string" && values.hero_eyebrow.trim() ? values.hero_eyebrow : defaults.eyebrow,
    title: typeof values.hero_title === "string" && values.hero_title.trim() ? values.hero_title : defaults.title,
    text: typeof values.hero_text === "string" && values.hero_text.trim() ? values.hero_text : defaults.text,
    imageAlt: typeof values.hero_image_alt === "string" && values.hero_image_alt.trim() ? values.hero_image_alt : defaults.imageAlt,
    primaryCta: typeof values.primary_cta_label === "string" && values.primary_cta_label.trim() ? values.primary_cta_label : defaults.primaryCta,
    secondaryCta: typeof values.secondary_cta_label === "string" && values.secondary_cta_label.trim() ? values.secondary_cta_label : defaults.secondaryCta,
    galleryHeading: typeof values.gallery_heading === "string" && values.gallery_heading.trim() ? values.gallery_heading : defaults.galleryHeading,
  };
}
