# pages/queues

## Overview
Tela "Minhas Filas" do agente: lista as filas do usuário logado com estado em tempo real e permite login, logout, pausa (com motivo) e retorno da pausa.

## Interface
- `QueueLoginService` (`queue-login.service.ts`): `getMyQueues()`, `login(queueId)`, `logout(queueId)`, `pause(queueId, pauseId)`, `unpause(queueId)`.
- `QueueLoginPage` (`app-queue-login`, `queue-login.ts`): `isLoggedIn`, `isPaused`, `pauseReasonName`, `isPauseExceeded`, `pauseDuration`, `togglePause`, `openPauseDialog`, `closePauseDialog`, `confirmPause`, `toggleLogin`.

## Invariants
- O estado vem de `GET /queues/states/my` e é mantido atualizado pelos tópicos STOMP `/topic/queuestates/{companyId}` e `/topic/queues-removed/{companyId}`.
- Pausa exige escolher um motivo (`pauseId`); `isPauseExceeded` compara a duração com o limite da pausa.
- O componente fornece a própria instância de `WebsocketService` (`useFactory: rxStompServiceFactory`).

## Side Effects
- HTTP: `GET /queues/states/my`, `POST /queues/states/{queueId}/login`, `DELETE /queues/states/{queueId}/logout`, `POST|DELETE /queues/states/{queueId}/pause`.
- Conexão WebSocket STOMP e `setInterval` de 1 s para o relógio (limpo em `ngOnDestroy`).

## Verification
- Run: `npm test` (na raiz de `frontend/`)
