# pabx/calendar

## Overview
CRUD de calendários de atendimento (dias da semana ou intervalo de datas, com ações), usados pelo dialplan para desviar chamadas conforme horário/data.

## Interface
- `CalendarService` (`calendar.service.ts`): `findAll()`, `findById(id)`, `create(calendar)`, `update(calendar)`, `delete(id)`.
- `CalendarPage` (`app-calendar-page`): `weekdayByEnum`, `formatRangeDates`, `formatDate`, `isOnlyWorkDays`, `wholeWeek`, `confirmDelete`.
- `NewCalendarPage` (`app-new-calendar-page`) e `EditCalendarPage` (`app-edit-calendar-page`): `addAction()`, `removeAction(index)`, `onRowReorder()`, `onSubmit()`.
- `utils.ts`: `calendarTypeOptions`, `calendarWeekDays`, `calendarValidateRangeDates(rangeDates)`.
- Rotas: `calendars`, `calendars/new`, `calendars/edit/:id`.

## Invariants
- O formulário alterna entre os controles `weekDays` e `rangeDates` conforme o tipo (`CalendarTypeEnum`); ambos exigem ao menos um item.
- `calendarValidateRangeDates`: se só a data inicial for escolhida, a data final recebe o mesmo valor.
- A ordem das ações é a ordem da tabela (reordenável por arrastar).

## Side Effects
- HTTP: `GET|POST /calendars`, `GET|PUT|DELETE /calendars/{id}`.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
