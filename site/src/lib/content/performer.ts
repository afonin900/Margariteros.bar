export type PerformerSocial = "instagram" | "facebook" | "tiktok" | "youtube" | "soundcloud" | "website";

export type PerformerPhoto = {
  src: string;
  width?: number;
  height?: number;
};

/**
 * Public performer contract.  It deliberately lives outside generated Emdash
 * types: the current Events schema has no DJ relation yet, while this is the
 * stable shape a future normalized performer entry must provide to the site.
 */
export type Performer = {
  name: string;
  photo?: PerformerPhoto;
  instagram?: string;
  bio?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  soundcloud?: string;
  website?: string;
};

type PerformerRow = {
  status: string;
  active: boolean;
  name: string | null;
  main_photo: unknown;
  bio: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
  soundcloud_url: string | null;
  website_url: string | null;
};

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord | null {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as UnknownRecord : null;
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function hasHost(url: URL, hosts: readonly string[]): boolean {
  return hosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
}

function socialUrl(value: unknown, social: PerformerSocial): string | undefined {
  const raw = text(value);
  if (!raw) return undefined;

  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return undefined;
    const allowedHosts: Record<Exclude<PerformerSocial, "website">, readonly string[]> = {
      instagram: ["instagram.com"],
      facebook: ["facebook.com", "fb.com"],
      tiktok: ["tiktok.com"],
      youtube: ["youtube.com", "youtu.be"],
      soundcloud: ["soundcloud.com"],
    };
    return social === "website" || hasHost(url, allowedHosts[social]) ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function photo(value: unknown): PerformerPhoto | undefined {
  const image = record(value);
  const src = text(image?.src);
  if (!src) return undefined;

  try {
    const url = new URL(src, "https://margariteros.bar");
    if (url.protocol !== "https:" || (url.origin === "https://margariteros.bar" && !src.startsWith("/"))) return undefined;
    const width = typeof image?.width === "number" && image.width > 0 ? image.width : undefined;
    const height = typeof image?.height === "number" && image.height > 0 ? image.height : undefined;
    return { src, ...(width ? { width } : {}), ...(height ? { height } : {}) };
  } catch {
    return undefined;
  }
}

/** A public card requires only a confirmed name; all presentation fields are optional. */
export function normalizePerformer(value: unknown): Performer | null {
  const input = record(value);
  const name = text(input?.name);
  const resolvedPhoto = photo(input?.main_photo ?? input?.photo);
  const instagram = socialUrl(input?.instagram_url ?? input?.instagram, "instagram");
  if (!name) return null;

  const performer: Performer = { name };
  const bio = text(input?.bio);
  if (resolvedPhoto) performer.photo = resolvedPhoto;
  if (instagram) performer.instagram = instagram;
  if (bio) performer.bio = bio;
  for (const social of ["facebook", "tiktok", "youtube", "soundcloud", "website"] as const) {
    const url = socialUrl(input?.[`${social}_url`] ?? input?.[social], social);
    if (url) performer[social] = url;
  }
  return performer;
}

/** Reads the event's primary performer through Emdash's public content API. */
export async function getEventPerformers(reference: string | undefined, locale: Locale): Promise<Performer[]> {
  if (!reference) return [];
  const { entries, error } = await getEmDashCollection<"performers", PerformerRow>("performers", { status: "published", locale, limit: 500 });
  if (error) return [];
  const entry = entries.find((candidate) => candidate.id === reference);
  if (!entry || entry.data.active !== true) return [];
  const performer = normalizePerformer(entry.data);
  return performer ? [performer] : [];
}
import { getEmDashCollection } from "emdash";
import type { Locale } from "../../content/page";
