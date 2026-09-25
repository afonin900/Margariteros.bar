---
schema: content-factory/channel-copy/v1
status: draft
artifact_id: 2026-09-04-dj-kike
revision: 2
channel: google-business-profile
format: event
source: .content-factory/work/content-pipeline/2026-09-04-dj-kike/gbp-longform-revision-1.md
qa_input: .content-factory/work/reviews/2026-W36-daily-experiment/qa.md
owner_direction: public_end_time_removed
external_publish: false
---

# GBP Event — каноническая правка 2

## Публичный текст PL — основной вариант

**Tytuł:** `DJ Kike w Margariteros`

**Opis:**

W piątek 4 września zagra u nas DJ Kike. Start o 21:00.

Margariteros to bar w centrum Warszawy, przy Chmielnej 7/9, z
latynoamerykańską atmosferą, muzyką i kuchnią uliczną inspirowaną Meksykiem.
Aktualne informacje o ofercie lokalu znajdziesz w profilu Google Business.

## Публичный текст EN — отдельная альтернатива

**Title:** `DJ Kike at Margariteros`

**Description:**

On Friday, September 4, DJ Kike will play at Margariteros. The music starts at
9 PM.

Margariteros is a bar in central Warsaw, at Chmielna 7/9, with a Latin
American atmosphere, music and Mexican-inspired street food. Current
information about the venue’s offer is available on the Google Business
profile.

EN хранить только как альтернативу польскому тексту; второй Event автоматически
не создавать.

## Внутренний технический кандидат для dry-run Buffer

Эти значения не являются публичным текстом и не должны выводиться пользователю
в карточке GBP до отдельной проверки живой схемы:

```yaml
metadata:
  google:
    type: event
    detailsEvent:
      title: DJ Kike w Margariteros
      startDate: 2026-09-04T21:00:00+02:00
      endDate: 2026-09-05T02:00:00+02:00
      isFullDayEvent: false
      button: none
```

`endDate` хранится только как технический кандидат для dry-run. В публичных
PL/EN-описаниях окончание в 02:00 не писать. URL не передавать. Адрес остаётся
в тексте и профиле Google Business; отдельное поле адреса в payload не добавлять.

## Проверка ограничений

- В публичных текстах указан только подтверждённый старт: 21:00.
- Публичное окончание события не упоминается ни в PL, ни в EN.
- Категориальный контекст сокращён до атмосферы, музыки и кухни; конкретные
  блюда, напитки, наличие и текущий список меню не обещаются.
- Нет цены, акции, условий входа, брони, CTA или заявления о визитах и
  измеримом результате.
- Описание не использует превосходных заявлений и не перегружено ключевыми
  словами.
- Внешних действий нет; перед возможной отправкой нужен отдельный dry-run и
  явное разрешение владельца.
