# pabx/queue

## Overview
CRUD de filas de atendimento e página de detalhe em tempo real da fila (chamadas aguardando, membros, nível de serviço, logout forçado de membro).

## Interface
- `QueueService` (`queue.service.ts`): `findAll()`, `findById(id)`, `create(body)`, `update(id, body)`, `delete(id)`.
- `QueuesPage` (`app-queues-page`): `confirmDelete(queue)`.
- `NewQueuePage` (`app-new-queue-page`) e `EditQueuePage` (`app-edit-queue-page`): `onSubmit()`, `moveToSelected(items: User[])`, `moveToAvailable(items: User[])`.
- `QueueDetailPage` (`app-queue-detail-page`): `waitTime`, `formatLastCall`, `isPausedMember`, `isPauseExceeded`, `memberStatusLabel`, `confirmForceLogout(member)`, `strategyLabel` e classes de destaque.
- Rotas: `queues`, `queues/new`, `queues/edit/:id`, `queues/detail/:id`.

## Invariants
- Membros da fila são usuários (`memberIds`), escolhidos em PickList com `transferPickListItems`.
- Defaults da nova fila: `queueStrategy = ALL`, `ringTimeout = 30`, `queueTimeout = 120`, `serviceLevelSeconds = 15`, `isJoinWhenEmpty = true`, `maxCalls = 0`, `cooldownSeconds = 0`, `tmeAlertSeconds = 30`, `callDurationAlertMinutes = 30`; `queueSoundId` obrigatório; `surveyId` opcional.
- `tmeAlertSeconds` e `callDurationAlertMinutes` >= 1 (alimentam os alertas do painel de filas).
- O botão de logout forçado só aparece para quem tem `RoleEnum.ROLE_COMPANY_SUPERVISOR` (`isSupervisor`).
- `QueueDetailPage` volta para `/pages/queues` quando a fila exibida chega em `/topic/queues-removed/{companyId}`.

## Side Effects
- HTTP: `GET|POST /queues`, `GET|PUT|DELETE /queues/{id}`; formulários carregam `MohService.findAll`, `UserService.findAll` e `SurveyService.findAll`; logout forçado via `QueueDashboardService.forceLogoutMember` (`DELETE /queues/states/{queueId}/members/{memberId}/logout`).
- STOMP em `QueueDetailPage`: `/topic/queuestates/{companyId}` e `/topic/queues-removed/{companyId}`, com instância própria de `WebsocketService`; `setInterval` de 1 s limpo em `ngOnDestroy`.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
