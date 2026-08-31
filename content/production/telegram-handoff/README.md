# Telegram handoff dla Instagram Reels

To jest wewnętrzny, niepubliczny kanał pracy SMM. Zastępuje draft Instagramu
w Postiz: muzykę trzeba dobrać w natywnej aplikacji Instagram, gdzie jej katalog
zależy od kraju i typu konta.

## Co bot wysyła do grupy SMM

1. Tekst `instagram/handoff.md`: fakty wydarzenia, podpis do skopiowania,
   geolokalizacja i propozycja wyszukania muzyki.
2. Gotowy, sprawdzony i oczyszczony po montażu plik `instagram/reel-remotion.mp4`.

## Co robi operator

1. Otwiera Reel w aplikacji Instagram i dodaje przesłany plik.
2. Kopiuje polski podpis z pakietu.
3. Wyszukuje proponowany utwór. Jego obecność w bibliotece potwierdza na tym
   koncie; gdy utworu nie ma, wybiera inną muzykę latino-urban i zapisuje decyzję
   w odpowiedzi w grupie.
4. Ustawia żywą geolokalizację i publikuje.

## Granice automatyzacji

- Facebook i Threads nadal mogą być publikowane przez Postiz wyłącznie po
  oddzielnym poleceniu właściciela „wykładaj”.
- Bot nie publikuje do Instagramu i nie wybiera muzyki w imieniu operatora.
- Wymagane później dane: istniejący bot dodany do grupy SMM oraz jego token i
  `chat_id` przechowywane poza Gitem. W tym repozytorium nie ma teraz ani bota,
  ani grupy, więc wysyłka nie została uruchomiona.

## Wysyłka

Najpierw sprawdź pakiet bez wysyłki:

```bash
bun content/production/telegram-handoff/send-instagram-handoff.ts \
  content/weeks/2026-W35/2026-08-28-dj-kike
```

Po dodaniu bota do właściwej grupy oraz osobnym poleceniu właściciela można
wysłać pakiet:

```bash
bun content/production/telegram-handoff/send-instagram-handoff.ts \
  --send content/weeks/2026-W35/2026-08-28-dj-kike
```
