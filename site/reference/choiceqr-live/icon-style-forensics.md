# ChoiceQR: точный источник и остаточная визуальная дельта

## Результат

«Проприетарные, недоступные иконки» не подтверждаются. В сохранённом live-DOM и в загруженных ChoiceQR JS-бандлах иконки — обычные inline SVG/React-компоненты (`24×24`, в основном `fill`). Их можно воспроизвести локально без внешнего сервиса. Локальная реализация сейчас подменяет их упрощёнными stroke-иконками в `site/src/components/ChoiceQrClone.astro:47-119`; это самостоятельный источник заметной RMSE.

Источники аудита: live `https://qr.margariteros.bar/` (захват `2026-08-26T21:27:51.584Z`), [dom-sanitized.html](dom-sanitized.html), [computed-styles.json](computed-styles.json), [css/01-6856bd2a9a01d8d3.css](css/01-6856bd2a9a01d8d3.css), [exact-acceptance.md](exact-acceptance.md), current network JS `https://cdn-clients.choiceqr.com/client/_next/static/chunks/1699.cc6280e5748cfcad.js`, `_app-c7573cf7f45061ff.js` и `2945.a6ed69a322ff7315.js`.

## Реальные переменные, шрифт и базовые правила

Runtime `<style id="__jsx-2524350362">` в live HTML задаёт именно:

| Переменная/правило | Live значение | Локальное состояние |
|---|---|---|
| `--primary-color` | `#ace01e` | совпадает как `--cq-primary` |
| `--theme-colors-100` | `#000000` | совпадает |
| `--theme-colors-200` | `#161d02` | совпадает |
| `--theme-colors-300` | `#ace01e` (лайм, не тёмный `#36400c`) | `--cq-300:#36400c`, неверно для live borders/shadows |
| `--theme-colors-400` | `rgba(255,255,255,.5)` | `#b6be81`, неверно для приглушённого текста |
| `--theme-colors-500` | `#fff` | совпадает |
| `--font-family` | `"Hind Siliguri", 'Inter', -apple-system, BlinkMacSystemFont, Segoe UI, …` | base `Inter`; отдельное имя `HindSiliguri` без пробела |
| body | Hind Siliguri, `16px/24px`, weight `400` | `Inter`, затем локальные точечные override |
| gallery title | Hind Siliguri, `32px/48px`, weight `700` | размер совпадает, семейство/метрики отличаются |

`HindSiliguri-latin.ttf` и Inter-варианты уже сохранены в [fonts/](fonts/), поэтому источник шрифта локально доступен. Нужно использовать имя семейства `Hind Siliguri` и runtime-переменные выше; нельзя выводить `#36400c`/`#b6be81` из Sass-placeholder в сохранённом CSS как будто это live-тема.

Ключевые CSS-правила live из `css/01-6856bd2a9a01d8d3.css`:

- общая кнопка `.styles_button___Dvql`: `min-height/min-width:48px`, `border-radius:8px`, `font-size:14px`, `line-height:1.2`, `font-weight:700`, `padding:0 16px`;
- stroke-кнопка `.styles_appearanceStroke__LKd1h`: `1px solid var(--theme-colors-300)` и `box-shadow:var(--box-shadow)`;
- mobile header `.styles_mainMobileHeader__kGS_R`: `min-height:96px`, background `var(--theme-colors-200)`; top padding `16px`; logo `64×64`, radius `8px`; action buttons `40×40`;
- `.styles_language__6ZQgV`: uppercase, `14px`, weight `700`, padding `0 16px 0 12px`, pseudo-chevron;
- footer `.styles_FooterWrapper__Ji6dI`: background `var(--theme-colors-100)`, inset top `1px var(--theme-colors-300)`; mobile horizontal padding `16px`;
- footer desktop `.styles_FooterBlockMap__pO0HF`: column width `40%`; `.styles_FooterBlocks__rhvNv`: width `60%`, right padding `24px`; map `.styles_FooterMap__AZx0V`: width `100%`, height `200px`, radius `8px`;
- language list `ul`: background theme-100, radius `12px`, border `1px solid theme-300`; `li`: padding `16px`, weight `600`, `16px`, border-top `1px solid theme-300`;
- drawer `.styles_sideBarMenu__EQSTn`: fixed full viewport; backdrop `rgba(34,34,34,.5)`; menu background theme-100, mobile width `calc(100vw - 72px)`, desktop max width `360px`; rows `.styles_item__h2xmM`: padding `16px 0`, bottom border `1px theme-300`, icon plus `12px` gap.

## Точная карта SVG

### Header и contact

| Live элемент | Точный источник/форма | Локально пригодно |
|---|---|---|
| language chevron (`header_language-button`, первый SVG в DOM) | `svg 24×24`, `path d="M6 9L12 15L18 9"`, `stroke="currentColor"`, `stroke-width="2"` | Да, literal path из [dom-sanitized.html](dom-sanitized.html); текущий `m6 9 6 6 6-6` геометрически близок, но не заменяет остальные vendor SVG |
| profile (`header_profile-button`, второй SVG) | `svg 24×24`, один filled path; точная каноническая строка целиком сохранена вторым SVG в [dom-sanitized.html](dom-sanitized.html) (и модулем `2940` в старом bundle), начинается `M12 2C6.477 2 ...`, содержит внутренний круг/плечи и заканчивается `...17.9121 17.375Z` | Да; текущая окружность+плечи в `ChoiceQrClone.astro:48,59` неэквивалентна |
| hamburger (`header_hamburger-button`, третий SVG) | три `<rect x="4" y="6|11|16" width="16" height="2" fill="var(--theme-colors-500)">`; `24×24` | Да; текущий stroked path в `:49,60` отличается толщиной/растеризацией |
| See on map | четвертый SVG DOM: `24×24`, filled pin path начинается `M18 0C15.791 0 14 1.791 14 4C14 6.857 18 11 18 11...`, далее polygon-map body; exact full `d` в [dom-sanitized.html](dom-sanitized.html) | Да; это не текстовый `⌁` из `ChoiceQrClone.astro:90` |
| Dial | пятый SVG DOM: `24×24`, filled handset path начинается `M13.9883 2.00294...`; exact full `d` в [dom-sanitized.html](dom-sanitized.html) | Да; это не текстовый `⌕` из `:91` |
| Booking | шестой SVG DOM: два filled path (круг/шестерня и стол/стул), exact full `d` в [dom-sanitized.html](dom-sanitized.html) | Да; текущий `▣` из `:92` неэквивалентен |

### Service cards

Это не «невидимые vendor assets»: current JS содержит React SVG-компоненты.

| Карточка | JS-модуль и точная форма | Локальный артефакт |
|---|---|---|
| Delivery | `_app-c7573cf7f45061ff.js`, module `71950`, export `c`: `svg viewBox="0 0 25 24"`, filled path `M19 5C18.172 5 17.5 5.672 17.5 6.5C17.5 6.67612 17.536 6.84296 17.5918 7H14.5V9H17.8066L18.0684 9.69727L17.9941 9.65625L13.9121 17H12.5C12.4999 16.9344 12.4934 16.869 12.4805 16.8047L11.7188 13H12.5V11H7.5V6H0.5V7V13H4.75391C4.63729 13.1481 4.51786 13.2955 4.41797 13.4453C3.83263 14.3233 3.5 15.1667 3.5 16C3.50005 16.2652 3.60543 16.5195 3.79297 16.707L3.95117 16.8652C3.68772 17.3567 3.52344 17.9076 3.52344 18.5C3.52344 20.4188 5.09478 22 7.01172 22C8.75777 22 10.2029 20.6839 10.4492 19H12.5H14.5H17.5742C17.8205 20.6839 19.2657 22 21.0117 22C22.9287 22 24.5 20.4188 24.5 18.5C24.5 17.0321 23.5776 15.7679 22.2871 15.252L22.1914 15H24.5V13H21.4414L19.5664 8H21.5V5H19Z...` (полный path в network bundle) | В repo нет отдельного SVG; безопасно перенести literal inline path в `ChoiceQrClone.astro:75` |
| Takeaway | `1699.cc6280e5748cfcad.js`, module `69094`, export `q`: `svg 24×24`, filled path `M20 8.80273L19 10.3027V21H21V10.3027L20 8.80273ZM5 3V7.30273L3 10.3027V21H17V10.3027C17 9.9079...` (полный path в network bundle) | В repo нет отдельного SVG; literal path в `:74` |
| Dine-in | В `AreaSwitcher` current module `36877` используется отдельный компонент `f` (filled map-pin/venue glyph; inline JSX), а не локальный fork/person. Его SVG берётся из того же 1699 bundle | Текущий fork в `:73` не является live-источником; нужен inline компонент из bundle |

Контроль размеров: при Android 390 live cards `x=16/136.65625/257.328125`, `y=300`, `116.66…×68.5`, font `600 11px/16.5px Hind Siliguri`; local геометрия почти совпала, но icon glyphs и font family нет.

### Footer и drawer

Footer inline SVG идут в DOM в фиксированном порядке: SVG №6 Instagram, №7 TikTok, №8 Google, №9 TripAdvisor, №10 Facebook, №11 Get directions. Все `24×24`, filled `currentColor`, полные path-строки сохранены в [dom-sanitized.html](dom-sanitized.html). Это точные источники, а не изображения и не placeholder: локальные `circle + plus` в `ChoiceQrClone.astro:106,111` нужно считать заведомо неверными.

Drawer source доказан current `2945.a6ed69a322ff7315.js`, компонент `tA`, а не недоступным CSS:

- map row: module `2793`, filled venue/map pin (`svg 24×24`);
- phone row: local inline `te`, filled handset (`svg 24×24`, тот же exact handset family, что Dial);
- email row: local inline `e9`, filled `@` glyph;
- website row: module `81230`, filled external-link/document glyph;
- social rows: module `16896`, named vendor exports (Instagram/TikTok/Google/TripAdvisor/Facebook);
- useful allergen row: module `66051`, `svg 16×16` warning circle with `!` and allergen letters;
- chevron: module `33896`, `path d="M9 18L15 12L9 6"`, stroke currentColor width 2;
- close tile: module `29891`, `svg viewBox="0 0 16 16"`, filled `X` path.

Live drawer CSS/source layout is likewise available: panel flush-left on mobile, login row at top, close tile outside panel; rows have icon + `12px` gap + external arrow. Local custom approximation is in `ChoiceQrClone.astro:119` and does not use these components.

Language sheet does not need a proprietary icon asset either: live saved DOM confirms selected row check is inline SVG and CSS confirms `ul` radius `12px`, `li` padding `16px`, border `theme-300` (live lime). Local sheet currently uses a plain back/search/check approximation (`:118`), centered compact header and flat rows, hence visual mismatch despite functional language list.

## Крупнейшие подтверждённые desktop/footer расхождения

| Профиль/область | Live | Local | Дельта/вывод |
|---|---:|---:|---|
| 1024 footer RMSE | — | — | `30.14%` (`rmse-desktop-1024-footer-viewport.txt`) — крупнейшая измеренная desktop ошибка |
| 1280 footer RMSE | — | — | `23.43%` |
| 1024 top RMSE | — | — | `19.93%` |
| 1280 top RMSE | — | — | `18.39%` |
| 1024 map | `x=609.609`, `y=1625`, `w=390.390`, `h=200` | `x=740.562`, `y=1593`, `w=251.437`, `h=200` | local на `+130.953px` правее, уже на `138.953px`, выше на `32px` |
| 1280 map | `x=763.203`, `y=1945`, `w=492.796`, `h=200` | `x=913.140`, `y=1913`, `w=310.859`, `h=200` | local на `+149.937px` правее, уже на `181.937px`, выше на `32px` |
| 390 mobile map | `x=16`, `y=2883.203`, `w=358`, `h=200` | `x=16`, `y=2910.203`, `w=358`, `h=200` | local ниже на `27px`; 320: `+11px`, 597/719: `+47px` |
| 1280 live footer | wrapper `y=2982.5`, `h=381`; content `x=0`, `w=1280`, `h=357`; map column `x=768`, `w=512` | local footer `h=395` (geometry record), narrower map/иная grid | structural mismatch in column split, vertical composition, powered/legal strips |

Paired screenshots показывают две главные причины desktop RMSE: live header translucent over background and black rounded inset main stage (`radius 16px` at desktop), тогда как local surfaces are opaque/differently placed; live footer uses native 40% map / 60% blocks and exact vendor icons, local uses a narrower three-column approximation and failed localhost map image/API. Fresh acceptance additionally records that all page heights and gallery geometry now match, so remaining error is concentrated in surfaces, typography, icons and footer/map—not gallery.

## Вывод для следующего изменения

1. Перенести в local `Hind Siliguri` как имя семейства и runtime palette (`theme-300=#ace01e`, `theme-400=rgba(255,255,255,.5)`).
2. Заменить hand-authored glyphs на exact inline SVG paths/modules above; отдельные SVG-файлы не требуются.
3. Сначала выровнять desktop footer grid/map (40/60, map `200px`, map x/width и y), затем mobile map y-offset; только после этого повторять RMSE.
4. Не объявлять карту функционально принятой: current local image/API не даёт live render на `127.0.0.1`, а разрешение ключа для целевого домена не доказано (`exact-acceptance.md:51-58`).

Изменения в реализации в рамках этого аудита не выполнялись.
