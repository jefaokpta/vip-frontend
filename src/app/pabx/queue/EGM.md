# pabx/queue

## Overview
CRUD de filas de atendimento. O detalhe em tempo real da fila fica em `pages/queues` (`queue-detail.page.ts`).

## Interface
- `QueueService` (`queue.service.ts`): `findAll()`, `findById(id)`, `create(body)`, `update(id, body)`, `delete(id)`.
- `QueuesPage` (`app-queues-page`): `confirmDelete(queue)`.
- `NewQueuePage` (`app-new-queue-page`) e `EditQueuePage` (`app-edit-queue-page`): `onSubmit()`, `moveToSelected(items: User[])`, `moveToAvailable(items: User[])`.
- Rotas: `queues`, `queues/new`, `queues/edit/:id`.

## Invariants
- Membros da fila são usuários (`memberIds`), escolhidos em PickList com `transferPickListItems`.
- Defaults da nova fila: `queueStrategy = ALL`, `ringTimeout = 30`, `queueTimeout = 120`, `serviceLevelSeconds = 15`, `isJoinWhenEmpty = true`, `maxCalls = 0`, `cooldownSeconds = 0`, `tmeAlertSeconds = 30`, `callDurationAlertMinutes = 30`; `queueSoundId` obrigatório; `surveyId` opcional.
- `tmeAlertSeconds` e `callDurationAlertMinutes` >= 1 (alimentam os alertas do painel de filas).

## Side Effects
- HTTP: `GET|POST /queues`, `GET|PUT|DELETE /queues/{id}`; formulários carregam `MohService.findAll`, `UserService.findAll` e `SurveyService.findAll`.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
