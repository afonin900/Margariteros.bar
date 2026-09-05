# Предлагаемое уточнение карты Штаба

Подготовлено 5 сентября 2026 года при местном переносе Margariteros.
Сам файл Штаба не изменён. Это проект поправки к карте, не новый список задач.

Источник: `/Users/afonin900/Github/afonin-hq/portfolio/projects.yaml`, запись
`id: margariteros`. Проверенные связи: общая задача
[№44](https://github.com/afonin900/Margariteros.bar/issues/44) и существующий
`afonin900/margariteros-booking-service`.

Предлагается адресная поправка:

1. Добавить `afonin900/margariteros-booking-service` в `repositories`.
2. Убрать дублирующее `last_verified_at: null`, сохранив уже записанное
   `last_verified_at: "2026-09-03"`. Проверка местной раскладки не меняет дату
   проверки живых систем.
3. В соответствующей карте местных рабочих путей, если она ведётся отдельно,
   указать `/Users/afonin900/Github/Margariteros/` как общий вход. Не вводить
   произвольное новое поле в YAML без проверки его схемы.

Существующие `status`, `verification_method` и `source_refs` сохранить.
Никаких выводов о текущей работе серверов эта поправка не делает.
