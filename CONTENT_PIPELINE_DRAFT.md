# Margariteros — content pipeline (draft)

**Status:** draft only. No publishing, account creation, service connection or advertising is authorised by this document.

## Purpose

Build a repeatable content operation for Margariteros Bar in Warsaw that:

- sells a concrete reason to visit now: event, promotion, menu item, table booking;
- communicates in natural contemporary Polish, not translated Russian or generic marketing Polish;
- reuses one source shoot across Instagram, TikTok, Facebook and YouTube Shorts, while keeping each format native;
- uses the Lime Fiesta visual system without producing visibly synthetic, AI-looking creative.

## Audience and positioning

Margariteros is a Mexican cocktail bar at Chmielna 7/9 in central Warsaw: tacos, margaritas and tequila, dancing, live music and DJ evenings.

Primary public language: Polish. English can be used where it is conventional in nightlife copy or helpful for visitors. Russian-language adaptation is an optional retention layer for selected Telegram announcements, never the main public brand identity.

## Content pillars

1. **Dzisiaj na Chmielnej** — DJ sets, live music, weekend plans and last-minute tables.
2. **Smak / oferta** — tacos, cocktails, tequila and recurring weekday promotions.
3. **Ludzie Margariteros** — bartenders, DJs, guests and short authentic stories.
4. **Klimat miejsca** — real sound, dance floor, service and details of the interior.
5. **Praktycznie** — address, opening hours, booking, menu and how to get there.

Each item has one action: reserve, visit today, try a specific item, or save/share the plan.

## Production pipeline

```text
Events, promotions, menu changes, photos/video from the bar
                         |
                         v
                 Weekly source brief
                         |
                         v
Codex: Polish copy, channel variants, shot list, CTA, captions,
      selection of Lime Fiesta template and a Canva build brief
                         |
                         v
Canva: compose supplied real photos/video with approved assets,
       typography and reusable branded layouts
                         |
                         v
Human fact + brand check
                         |
                         v
Finalny montaż każdego pliku kanału
                         |
                         v
Kontrola i oczyszczenie gotowego pliku po montażu
                         |
                         v
        ┌────────────────┴────────────────┐
        v                                 v
Facebook + Threads через Postiz      Instagram: wewnętrzny pakiet
po osobnym „wykładaj”               do grupy SMM na Telegramie
                                           |
                                           v
                            Człowiek dodaje muzykę w aplikacji Instagram
                            i publikuje Reel
                         |
                         v
Explicit approval before any publication
```

## Canva-first visual policy

- Use real bar photography and video as the hero material whenever available.
- Use the approved Lime Fiesta assets only as frames, overlays, end cards, stickers and text zones.
- Prepare reusable Canva templates for: event Reel cover, feed event card, promotion Story, cocktail card, weekly plan and review/quote card.
- Codex prepares the copy, crop guidance, asset choice and exact placement notes; Canva is the final assembly environment.
- AI image generation is exceptional, not the default. It may create a small isolated background/texture only when no real photo is needed. It must never imitate a real guest, staff member, interior or event that was not photographed.
- Avoid common synthetic signals: polished fake people, invented cocktails, inconsistent branding, excessive neon/3D effects, impossible glassware, text baked into images, and template-only feeds.
- Preserve the asset-pack rules: do not upscale raster assets; repeat tiles rather than stretch them; mascot keeps one glass stem and no legs.

## Channel roles

| Channel | Job | Default cadence | Native treatment |
|---|---|---:|---|
| Instagram | trust, bookings, current events | 3–4 feed/Reels + daily Stories | gotowy czysty plik + tekst trafiają do wewnętrznej grupy SMM na Telegramie; operator dodaje muzykę natywnie w Instagramie |
| Facebook Page | local search, events, Meta operations | reuse selected IG posts/events | tekst może wyjść przez Postiz po osobnym „wykładaj” |
| Threads | szybki tekstowy powód do wizyty | wybrane wydarzenia | tekst może wyjść przez Postiz po osobnym „wykładaj” |
| Google Business Profile | intent and trust | weekly update + review response routine | factual updates, photos, menu and booking accuracy |
| YouTube Shorts | lightweight archive/search | 1–2 best videos | clear Warsaw/search title and description |
| Telegram — grupa SMM | wewnętrzne przekazanie materiału do ręcznej publikacji Instagramu | jeden pakiet na Reel | bot wysyła gotowe wideo, podpis, fakty i propozycję muzyki; to nie jest publiczny kanał dla gości |
| Telegram pilot dla gości | retention for opt-in audience | 2–3 exclusive posts | osobna przyszła decyzja; nie mieszać z grupą SMM |

## Competitive intelligence

Weekly, review a small stable set of Warsaw nightlife peers and local event media. Capture only public observations:

- recurring formats and event lead time;
- hooks, Polish wording and CTA structure;
- formats that attract visible comments/shares;
- offers, partnerships and community mechanics;
- gaps Margariteros can own.

Do not copy copywriting, visuals, music or footage. Record observations and turn them into original hypotheses to test.

## Weekly deliverable

One reviewable package, prepared before publishing:

1. seven-day calendar with factual source for every claim;
2. 3–4 Polish post/Reel drafts and 5–7 Story drafts;
3. TikTok variants with hooks and subtitle text;
4. Canva build sheet: source media, template, crop, overlay, copy and CTA;
5. fact-check list: date, artist, time, price, availability, booking URL and opening hours;
6. competitor observations and one testable hypothesis.

## Non-negotiable checks

- No invented event, performer, price, offer, product, review or availability.
- No automatic publication or paid promotion without explicit approval.
- Każdy finalny plik kanału przechodzi kontrolę AI-artefaktów **po montażu**,
  nie tylko przy przyjęciu zdjęcia lub wideo źródłowego. Oczyszczenie źródła
  nie zastępuje kontroli gotowego eksportu; jeśli narzędzie nie obsługuje
  formatu albo jest niedostępne, materiał pozostaje `draft`. Dla MP4 po
  usunięciu metadanych wymagane są zarówno ponowne `/inspect`, jak i pełna
  kontrola dekodowania; szczegóły są w `content/production/ai-cleanup/README.md`.
- No posts in Russian on the main public channels unless a separately approved campaign requires it.
- Reel do Instagramu nie trafia do Postiz jako draft ani do publikacji. Bot Telegrama
  przekazuje operatorowi wyłącznie oczyszczony finalny MP4, podpis i instrukcję.
  Propozycja muzyki jest hasłem do wyszukania w aplikacji, nie obietnicą dostępności
  w bibliotece konta; operator potwierdza ją na urządzeniu przed publikacją.
- Polish copy is reviewed for natural local phrasing before first use, ideally by a Polish-speaking team member.
- Track outcomes per item: reach, saves, shares, profile visits, booking clicks, messages and attributable visits where possible.

## Deferred decisions

- Official Facebook Page creation and account ownership model.
- Whether to launch Telegram after a four-week content pilot.
- Canva workspace, owner, template access and source-media handoff.
- Exact competitor benchmark list and access to platform analytics.
