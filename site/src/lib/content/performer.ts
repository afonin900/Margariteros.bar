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

/** Reads published, active performers linked to one event translation group. */
export async function getEventPerformers(db: unknown, eventSlug: string | undefined, locale: Locale): Promise<Performer[]> {
  if (!db || !eventSlug) return [];
  try {
    const result = await sql<PerformerRow>`
      WITH target_groups_raw AS (
        SELECT reference.child_group AS translation_group, reference.sort_order AS sort_order
        FROM _emdash_content_references AS reference
        INNER JOIN _emdash_relations AS relation
          ON relation.translation_group = reference.relation_group
          AND relation.name = 'event_performers'
          AND relation.locale = ${locale}
        INNER JOIN ec_events AS linked_event
          ON linked_event.translation_group = reference.parent_group
          AND linked_event.slug = ${eventSlug}
          AND linked_event.locale = ${locale}
        UNION
        SELECT primary_performer.translation_group, -1 AS sort_order
        FROM ec_events AS primary_event
        INNER JOIN ec_performers AS primary_performer
          ON primary_performer.id = primary_event.primary_performer
        WHERE primary_event.slug = ${eventSlug} AND primary_event.locale = ${locale}
      ), target_groups AS (
        SELECT translation_group, MIN(sort_order) AS sort_order
        FROM target_groups_raw
        GROUP BY translation_group
      )
      SELECT performer.name, performer.main_photo, performer.bio,
        performer.instagram_url, performer.facebook_url, performer.tiktok_url,
        performer.youtube_url, performer.soundcloud_url, performer.website_url
      FROM target_groups
      INNER JOIN ec_performers AS performer
        ON performer.translation_group = target_groups.translation_group
        AND performer.locale = ${locale}
      WHERE performer.status = 'published'
        AND performer.active = 1
      ORDER BY target_groups.sort_order ASC
    `.execute(db as Kysely<Record<string, never>>);
    return result.rows.flatMap((row) => {
      const performer = normalizePerformer(row);
      return performer ? [performer] : [];
    });
  } catch {
    // A pre-migration runtime has no performers table. Events must remain live.
    return [];
  }
}
import { sql, type Kysely } from "kysely";
import type { Locale } from "../../content/page";
