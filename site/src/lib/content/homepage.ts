import { getEmDashEntry } from "emdash";
import type { MediaValue } from "emdash";
import type { Homepage } from "../../../.emdash/types";
import { getPage, type Locale } from "../../content/page";

const INTERNAL_MEDIA_PREFIX = "/_emdash/api/media/file/";
const SAFE_STORAGE_KEY = /^[A-Za-z0-9._/-]+$/;

export type HomepageGalleryItem = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type HomepageHero = {
  image: { src: string; width: number; height: number };
  eyebrow: string;
  title: string;
  text: string;
  imageAlt: string;
  primaryCta: string;
  secondaryCta: string;
  galleryHeading: string;
  galleryItems: readonly HomepageGalleryItem[];
};

type HomepageCopy = Omit<HomepageHero, "galleryItems">;
type PublicMediaResolver = (storageKey: string) => string;

const fallback: Record<Locale, HomepageCopy> = {
  pl: { image: { src: "/media/gallery/dance-floor-400.webp", width: 400, height: 400 }, eyebrow: "CHMIELNA 7/9 · WARSZAWA", title: "WYDARZENIA W CENTRUM WARSZAWY", text: "Muzyka, taniec i meksykańska kuchnia. Zobacz program i wybierz swój wieczór.", imageAlt: "Goście podczas wydarzenia w Margariteros", primaryCta: "ZAREZERWUJ STOLIK", secondaryCta: "ZOBACZ MENU", galleryHeading: "ZOBACZ, JAK JEST U NAS" },
  en: { image: { src: "/media/gallery/dance-floor-400.webp", width: 400, height: 400 }, eyebrow: "CHMIELNA 7/9 · WARSAW", title: "EVENTS IN CENTRAL WARSAW", text: "Music, dance and Mexican food. Explore the programme and choose your evening.", imageAlt: "Guests at an event at Margariteros", primaryCta: "BOOK A TABLE", secondaryCta: "VIEW MENU", galleryHeading: "SEE THE ATMOSPHERE" },
  ru: { image: { src: "/media/gallery/dance-floor-400.webp", width: 400, height: 400 }, eyebrow: "CHMIELNA 7/9 · WARSZAWA", title: "СОБЫТИЯ В ЦЕНТРЕ ВАРШАВЫ", text: "Музыка, танцы и мексиканская кухня. Посмотрите программу и выберите свой вечер.", imageAlt: "Гости на мероприятии в Margariteros", primaryCta: "ЗАБРОНИРОВАТЬ", secondaryCta: "ПОСМОТРЕТЬ МЕНЮ", galleryHeading: "ПОСМОТРЕТЬ АТМОСФЕРУ" },
  es: { image: { src: "/media/gallery/dance-floor-400.webp", width: 400, height: 400 }, eyebrow: "CHMIELNA 7/9 · VARSOVIA", title: "EVENTOS EN EL CENTRO DE VARSOVIA", text: "Música, baile y cocina mexicana. Descubre el programa y elige tu noche.", imageAlt: "Invitados en un evento de Margariteros", primaryCta: "RESERVAR MESA", secondaryCta: "VER MENÚ", galleryHeading: "DESCUBRE EL AMBIENTE" },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSafeStorageKey(value: string): boolean {
  if (!SAFE_STORAGE_KEY.test(value) || value.startsWith("/") || value.includes("..")) return false;
  return value.split("/").every((segment) => segment.length > 0 && segment !== ".");
}

function positiveDimension(value: unknown, fallbackValue: number): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.round(value) : fallbackValue;
}

/**
 * Resolve an Emdash local or external media value for an SSR image.
 * Emdash may keep the local storage key in meta.storageKey and omit src after
 * an admin save, so the resolver must prefer that key over a cached URL.
 */
export function resolveHomepageMediaUrl(
  image: Pick<MediaValue, "id" | "src" | "provider" | "meta">,
  resolvePublicMediaUrl?: PublicMediaResolver,
): string {
  const storageKey = typeof image.meta?.storageKey === "string" ? image.meta.storageKey : undefined;
  if (storageKey && isSafeStorageKey(storageKey)) {
    return resolvePublicMediaUrl ? resolvePublicMediaUrl(storageKey) : `${INTERNAL_MEDIA_PREFIX}${storageKey}`;
  }

  const src = typeof image.src === "string" ? image.src.trim() : "";
  if (src) {
    if (image.provider === "local" && isSafeStorageKey(src)) {
      return resolvePublicMediaUrl ? resolvePublicMediaUrl(src) : `${INTERNAL_MEDIA_PREFIX}${src}`;
    }
    return src;
  }

  return image.id ? `${INTERNAL_MEDIA_PREFIX}${image.id}` : "";
}

function fallbackGallery(locale: Locale): readonly HomepageGalleryItem[] {
  return getPage(locale).galleryItems.map(({ src, alt, width, height }) => ({ src, alt, width, height }));
}

function fallbackHomepage(locale: Locale): HomepageHero {
  return { ...fallback[locale], galleryItems: fallbackGallery(locale) };
}

/**
 * Turn the native Emdash repeater into the small render contract used by the
 * homepage. Invalid rows are ignored; the caller can then use the complete
 * static gallery as a safe fallback instead of rendering a partial gallery.
 */
export function resolveHomepageGallery(
  _locale: Locale,
  value: unknown,
  resolvePublicMediaUrl?: PublicMediaResolver,
): HomepageGalleryItem[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((row) => {
    if (!isRecord(row) || !isRecord(row.image)) return [];
    const image = row.image as unknown as MediaValue;
    const src = resolveHomepageMediaUrl(image, resolvePublicMediaUrl);
    const alt = typeof row.alt === "string" && row.alt.trim()
      ? row.alt.trim()
      : typeof image.alt === "string" ? image.alt.trim() : "";
    if (!src || !alt) return [];

    return [{
      src,
      alt,
      width: positiveDimension(image.width, 400),
      height: positiveDimension(image.height, 400),
    }];
  });
}

/**
 * Images are common to every language, while their accessible descriptions
 * intentionally stay translated.  Keep the two repeater fields paired here
 * so a partial migration cannot render an image with another language's text.
 */
export function resolveSharedHomepageGallery(
  images: unknown,
  alts: unknown,
  resolvePublicMediaUrl?: PublicMediaResolver,
): HomepageGalleryItem[] {
  if (!Array.isArray(images) || !Array.isArray(alts) || images.length !== alts.length) return [];

  const items = images.flatMap((row, index) => {
    const altRow = alts[index];
    if (!isRecord(row) || !isRecord(row.image) || !isRecord(altRow)) return [];
    const image = row.image as unknown as MediaValue;
    const src = resolveHomepageMediaUrl(image, resolvePublicMediaUrl);
    const alt = typeof altRow.alt === "string" ? altRow.alt.trim() : "";
    if (!src || !alt) return [];

    return [{
      src,
      alt,
      width: positiveDimension(image.width, 400),
      height: positiveDimension(image.height, 400),
    }];
  });

  return items.length === images.length ? items : [];
}

export async function getHomepageHero(
  locale: Locale,
  resolvePublicMediaUrl?: PublicMediaResolver,
): Promise<HomepageHero> {
  const defaults = fallbackHomepage(locale);
  const { entry, error } = await getEmDashEntry<"homepage", Homepage>("homepage", "main", { locale });
  if (error || !entry || entry.data.status !== "published") return defaults;

  const data = entry.data;
  // During the one-time migration the new, non-translatable values become
  // authoritative.  The old fields remain only as a safe read fallback until
  // their separately confirmed cleanup.
  const image = data.shared_hero_image ?? data.hero_image;
  const heroImageSrc = image ? resolveHomepageMediaUrl(image, resolvePublicMediaUrl) : "";
  const sharedGalleryItems = resolveSharedHomepageGallery(
    data.shared_gallery_images,
    data.gallery_item_alts,
    resolvePublicMediaUrl,
  );
  const legacyGalleryItems = resolveHomepageGallery(locale, data.gallery_items, resolvePublicMediaUrl);
  const galleryItems = sharedGalleryItems.length > 0 ? sharedGalleryItems : legacyGalleryItems;

  return {
    image: heroImageSrc
      ? { src: heroImageSrc, width: image?.width ?? 1200, height: image?.height ?? 800 }
      : defaults.image,
    eyebrow: data.hero_eyebrow?.trim() || defaults.eyebrow,
    title: data.hero_title?.trim() || defaults.title,
    text: data.hero_text?.trim() || defaults.text,
    imageAlt: data.hero_image_alt?.trim() || defaults.imageAlt,
    primaryCta: data.primary_cta_label?.trim() || defaults.primaryCta,
    secondaryCta: data.secondary_cta_label?.trim() || defaults.secondaryCta,
    galleryHeading: data.gallery_heading?.trim() || defaults.galleryHeading,
    galleryItems: galleryItems.length >= 4 && galleryItems.length <= 20
      ? galleryItems
      : defaults.galleryItems,
  };
}
