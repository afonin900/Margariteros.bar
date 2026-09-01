import { copyFile, mkdir, readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { Kysely } from "kysely";
import { createDialect } from "emdash/db/sqlite";
import {
  ContentRepository,
  MediaRepository,
  handleContentCreate,
  handleContentGet,
  handleContentPublish,
} from "emdash";

const apply = process.argv.includes("--apply");
const databasePath = process.env.EMDASH_DATABASE_PATH ?? "/app/data/emdash.db";
const uploadsPath = process.env.EMDASH_UPLOADS_PATH ?? "/app/data/uploads";
const publicPath = process.env.EMDASH_PUBLIC_PATH ?? "/app/dist/client";
const locales = ["pl", "en", "ru", "es"];
const defaultLocale = "pl";

const db = new Kysely({ dialect: createDialect({ url: databasePath }) });

const textBlock = (text) => [{
  _type: "block",
  style: "normal",
  children: [{ _type: "span", text, marks: [] }],
  markDefs: [],
}];

async function media(filename, sourceName, alt) {
  const repository = new MediaRepository(db);
  const existing = await repository.findByFilename(filename);
  if (existing) return existing;
  if (!apply) return { filename, missing: true };

  const source = `${publicPath}/media/gallery/${sourceName}`;
  const bytes = await readFile(source);
  const contentHash = createHash("sha256").update(bytes).digest("hex");
  const duplicate = await repository.findByContentHash(contentHash);
  if (duplicate) return duplicate;

  const storageKey = `seed/${filename}`;
  await mkdir(`${uploadsPath}/seed`, { recursive: true });
  await copyFile(source, `${uploadsPath}/${storageKey}`);
  const file = await stat(source);
  return repository.create({
    filename,
    mimeType: "image/webp",
    size: file.size,
    width: 400,
    height: 400,
    alt,
    storageKey,
    contentHash,
    status: "ready",
  });
}

function imageValue(item) {
  return {
    id: item.id,
    provider: "local",
    src: item.storageKey,
    filename: item.filename,
    mimeType: item.mimeType,
    width: item.width,
    height: item.height,
    alt: item.alt,
    meta: { storageKey: item.storageKey },
  };
}

async function publish(collection, id) {
  const result = await handleContentPublish(db, collection, id);
  if (!result.success) throw new Error(`${collection}/${id}: ${result.error.code}: ${result.error.message}`);
}

/**
 * Create one published locale row, linked to the default-language row when
 * `translationOf` is supplied. Existing rows are left untouched so rerunning
 * this fixture cannot overwrite edits made in the Emdash admin.
 */
async function createPublished(collection, slug, locale, data, translationOf) {
  const repository = new ContentRepository(db);
  const existing = await repository.findByIdOrSlug(collection, slug, locale);
  if (existing) {
    if (apply && existing.status !== "published") {
      await publish(collection, existing.id);
      const readback = await handleContentGet(db, collection, existing.id, locale);
      if (!readback.success || readback.data.item.status !== "published") {
        throw new Error(`${collection}/${slug}/${locale}: existing row publish readback failed`);
      }
      return {
        slug,
        locale,
        state: "published-existing",
        id: existing.id,
        translationGroup: existing.translationGroup,
      };
    }
    return {
      slug,
      locale,
      state: "already-present",
      id: existing.id,
      status: existing.status,
      translationGroup: existing.translationGroup,
    };
  }

  if (!apply) {
    return {
      slug,
      locale,
      state: "would-create",
      translationOf: translationOf ?? null,
    };
  }

  const created = await handleContentCreate(db, collection, {
    slug,
    locale,
    translationOf,
    status: "draft",
    data,
  });
  if (!created.success) throw new Error(`${collection}/${slug}/${locale}: ${created.error.code}: ${created.error.message}`);

  await publish(collection, created.data.item.id);
  const readback = await handleContentGet(db, collection, created.data.item.id, locale);
  if (
    !readback.success
    || readback.data.item.status !== "published"
    || readback.data.item.locale !== locale
  ) {
    throw new Error(`${collection}/${slug}/${locale}: published readback failed`);
  }

  return {
    slug,
    locale,
    state: "published",
    id: created.data.item.id,
    translationOf: translationOf ?? null,
    translationGroup: readback.data.item.translationGroup,
  };
}

async function seedTranslatedEntry(collection, slug, dataByLocale) {
  const repository = new ContentRepository(db);
  const existingByLocale = new Map();
  for (const locale of locales) {
    const existing = await repository.findByIdOrSlug(collection, slug, locale);
    if (existing) existingByLocale.set(locale, existing);
  }

  let anchorId = existingByLocale.get(defaultLocale)?.id;
  const plannedAnchor = `planned:${collection}/${slug}/${defaultLocale}`;
  const report = [];

  for (const locale of locales) {
    const translationOf = locale === defaultLocale ? undefined : anchorId ?? plannedAnchor;
    const result = await createPublished(collection, slug, locale, dataByLocale[locale], translationOf);
    report.push(result);

    // The anchor is created first when the database is being populated. This
    // gives all subsequent rows a real Emdash id for `translationOf`.
    if (locale === defaultLocale && result.id) anchorId = result.id;
  }

  return report;
}

const homepageCopy = {
  pl: {
    hero_eyebrow: "CHMIELNA 7/9 · WARSZAWA",
    hero_title: "WYDARZENIA W CENTRUM WARSZAWY",
    hero_text: "Muzyka, taniec i meksykańska kuchnia. Zobacz program i wybierz swój wieczór.",
    hero_image_alt: "Goście podczas wydarzenia w Margariteros",
    primary_cta_label: "ZAREZERWUJ STOLIK",
    secondary_cta_label: "ZOBACZ MENU",
    gallery_heading: "ZOBACZ, JAK JEST U NAS",
  },
  en: {
    hero_eyebrow: "CHMIELNA 7/9 · WARSAW",
    hero_title: "EVENTS IN CENTRAL WARSAW",
    hero_text: "Music, dance and Mexican food. Explore the programme and choose your evening.",
    hero_image_alt: "Guests at an event at Margariteros",
    primary_cta_label: "BOOK A TABLE",
    secondary_cta_label: "VIEW MENU",
    gallery_heading: "SEE THE ATMOSPHERE",
  },
  ru: {
    hero_eyebrow: "CHMIELNA 7/9 · WARSZAWA",
    hero_title: "СОБЫТИЯ В ЦЕНТРЕ ВАРШАВЫ",
    hero_text: "Музыка, танцы и мексиканская кухня. Посмотрите программу и выберите свой вечер.",
    hero_image_alt: "Гости на мероприятии в Margariteros",
    primary_cta_label: "ЗАБРОНИРОВАТЬ",
    secondary_cta_label: "ПОСМОТРЕТЬ МЕНЮ",
    gallery_heading: "ПОСМОТРЕТЬ АТМОСФЕРУ",
  },
  es: {
    hero_eyebrow: "CHMIELNA 7/9 · VARSOVIA",
    hero_title: "EVENTOS EN EL CENTRO DE VARSOVIA",
    hero_text: "Música, baile y cocina mexicana. Descubre el programa y elige tu noche.",
    hero_image_alt: "Invitados en un evento de Margariteros",
    primary_cta_label: "RESERVAR MESA",
    secondary_cta_label: "VER MENÚ",
    gallery_heading: "DESCUBRE EL AMBIENTE",
  },
};

function homepageData(locale, heroMedia) {
  return {
    name: "Main homepage",
    hero_image: imageValue(heroMedia),
    ...homepageCopy[locale],
  };
}

const eventDefinitions = [
  {
    slug: "test-music-evening-2026-09-05",
    starts_at: "2026-09-05T19:00:00+02:00",
    imageKey: "music",
    localized: {
      pl: {
        title: "TEST — wieczór z muzyką",
        summary: "Przykładowa karta. To nie jest prawdziwe wydarzenie.",
        details: "To wydarzenie testowe służy wyłącznie do sprawdzenia wyglądu i obsługi strony.",
      },
      en: {
        title: "TEST — music evening",
        summary: "Example card. This is not a real event.",
        details: "This test event exists only to demonstrate the website layout and editing flow.",
      },
      ru: {
        title: "ТЕСТ — музыкальный вечер",
        summary: "Пример карточки. Это не настоящее событие.",
        details: "Это тестовое мероприятие существует только для проверки вида и редактирования сайта.",
      },
      es: {
        title: "PRUEBA — noche de música",
        summary: "Tarjeta de ejemplo. No es un evento real.",
        details: "Este evento de prueba solo sirve para comprobar el diseño y la edición del sitio.",
      },
    },
  },
  {
    slug: "test-dance-evening-2026-09-12",
    starts_at: "2026-09-12T20:00:00+02:00",
    imageKey: "dance",
    localized: {
      pl: {
        title: "TEST — wieczór taneczny",
        summary: "Przykładowa karta do oceny wyglądu. Bez rezerwacji.",
        details: "To wydarzenie testowe służy wyłącznie do sprawdzenia wyglądu i obsługi strony.",
      },
      en: {
        title: "TEST — dance evening",
        summary: "Example card for design review. Booking is disabled.",
        details: "This test event exists only to demonstrate the website layout and editing flow.",
      },
      ru: {
        title: "ТЕСТ — танцевальный вечер",
        summary: "Пример карточки для оценки дизайна. Бронь отключена.",
        details: "Это тестовое мероприятие существует только для проверки вида и редактирования сайта.",
      },
      es: {
        title: "PRUEBA — noche de baile",
        summary: "Tarjeta de ejemplo para evaluar el diseño. Sin reserva.",
        details: "Este evento de prueba solo sirve para comprobar el diseño y la edición del sitio.",
      },
    },
  },
];

function eventData(event, locale, image) {
  const copy = event.localized[locale];
  const baseLegacyPath = `staging-preview/${event.slug}`;
  return {
    starts_at: event.starts_at,
    event_state: "scheduled",
    title: copy.title,
    summary: copy.summary,
    details: textBlock(copy.details),
    hero_image: imageValue(image),
    booking_url: "",
    fact_sources: "Demonstration fixture requested by the owner; not a real event",
    facts_confirmed_at: "2026-09-01T09:00:00+02:00",
    // legacy_path is unique in the current schema, so each locale gets a
    // stable suffix while all rows retain the same human-readable base path.
    legacy_path: locale === defaultLocale ? baseLegacyPath : `${baseLegacyPath}#${locale}`,
  };
}

try {
  const heroMedia = await media("homepage-hero-dance-floor.webp", "dance-floor-400.webp", "Guests at Margariteros");
  const musicMedia = await media("test-event-music.webp", "dance-floor-400.webp", "Demonstration event card");
  const danceMedia = await media("test-event-dance.webp", "live-music-400.webp", "Demonstration event card");
  const eventMedia = { music: musicMedia, dance: danceMedia };

  const homepage = await seedTranslatedEntry(
    "homepage",
    "main",
    Object.fromEntries(locales.map((locale) => [locale, homepageData(locale, heroMedia)])),
  );

  const events = [];
  for (const event of eventDefinitions) {
    events.push({
      slug: event.slug,
      locales: await seedTranslatedEntry(
        "events",
        event.slug,
        Object.fromEntries(locales.map((locale) => [
          locale,
          eventData(event, locale, eventMedia[event.imageKey]),
        ])),
      ),
    });
  }

  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", homepage, events }, null, 2));
} finally {
  await db.destroy();
}
