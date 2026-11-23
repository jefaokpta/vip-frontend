# pages/queues

## Overview
Tela "Minhas Filas" do agente: lista as filas do usuário logado com estado em tempo real e permite login, logout, pausa (com motivo) e retorno da pausa.
Também contém o detalhe em tempo real de uma fila do Painel de Filas (chamadas aguardando, membros, nível de serviço, logout forçado de membro), em `/pages/queues/detail/:id`.

## Interface
- `QueueLoginService` (`queue-login.service.ts`): `getMyQueues()`, `login(queueId)`, `logout(queueId)`, `pause(queueId, pauseId)`, `unpause(queueId)`.
- `QueueLoginPage` (`app-queue-login`, `queue-login.ts`): `isLoggedIn`, `isPaused`, `pauseReasonName`, `isPauseExceeded`, `pauseDuration`, `togglePause`, `openPauseDialog`, `closePauseDialog`, `confirmPause`, `toggleLogin`.
- `QueueDetailPage` (`app-queue-detail-page`, `queue-detail.page.ts`): `waitTime`, `formatLastCall`, `isPausedMember`, `isPauseExceeded`, `memberStatusLabel`, `confirmForceLogout(member)`, `strategyLabel` e classes de destaque. Rota `queues/detail/:id` em `pages/pages.routes.ts`, com os guards de módulo PABX e `ROLE_COMPANY_SUPERVISOR`.

## Invariants
- O estado vem de `GET /queues/states/my` e é mantido atualizado pelos tópicos STOMP `/topic/queuestates/{companyId}` e `/topic/queues-removed/{companyId}`.
- Pausa exige escolher um motivo (`pauseId`); `isPauseExceeded` compara a duração com o limite da pausa.
- Os dois componentes fornecem a própria instância de `WebsocketService` (`useFactory: rxStompServiceFactory`).
- O botão de logout forçado do detalhe só aparece para quem tem `RoleEnum.ROLE_COMPANY_SUPERVISOR` (`isSupervisor`).
- `QueueDetailPage` volta para `/pages/queues` quando a fila exibida chega em `/topic/queues-removed/{companyId}`.

## Side Effects
- HTTP: `GET /queues/states/my`, `POST /queues/states/{queueId}/login`, `DELETE /queues/states/{queueId}/logout`, `POST|DELETE /queues/states/{queueId}/pause`; detalhe: logout forçado via `QueueDashboardService.forceLogoutMember` (`DELETE /queues/states/{queueId}/members/{memberId}/logout`).
- Conexão WebSocket STOMP e `setInterval` de 1 s para o relógio (limpo em `ngOnDestroy`), nos dois componentes.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
