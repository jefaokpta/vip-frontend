# pages/dashboard

## Overview
Painéis operacionais: "Minhas Chamadas" (página inicial do app), painel de ramais em tempo real, painel de filas com métricas de SLA/TME e alertas, e painel de workers de mídia. Inclui o estado em memória das chamadas do usuário e as funções puras de métricas de fila.

## Interface
- `MyCallsDashboard` (`app-my-calls-dashboard`, `my-calls.dashboard.ts`): rota `''` da área autenticada; `refresh()`, `onFilterGlobal(event)`; computeds `totalCalls`, `avgDuration`, `rate`, `talkSeconds`, `tableRows`.
- `MyCallsStateService` (`my-calls-state.service.ts`): `cdrs`, `loaded` (readonly), `setCdrs(cdrs)`, `reset()`.
- `PeerDashboard` (`app-components-dashboard`, `peer.dashboard.ts`): `canCall(pr)`, `callPeer(pr)`, `setViewMode('unified' | 'department')`, helpers de rótulo/classe por status e `getCallDuration(pr)`.
- `PeerDashboardService` (`peer-dashboard.service.ts`): `findPeerRegistries()`.
- `QueueDashboard` (`app-queue-dashboard`, `queue.dashboard.ts`): helpers de exibição (`alertsOf`, `queueTme`, `queueSl`, etc.).
- `QueueDashboardService` (`queue-dashboard.service.ts`): `findAllQueueStates()`, `findTodayHourly()`, `forceLogoutMember(queueId, memberId)`.
- `queue-dashboard.metrics.ts`: `globalTmeSeconds`, `globalServiceLevel`, `queueServiceLevel`, `queueAlerts`, `serviceLevelSeverity`, `memberCounts`, `percentOf`, `memberAlerts`, `formatDuration`; tipos `QueueAlert` (`'SLA_CRITICAL' | 'TME_HIGH'`) e `MemberAlert` (`'LONG_PAUSE' | 'LONG_CALL'`).
- `WorkersDashboard` (`app-workers-dashboard`, `workers.dashboard.ts`) e `WorkersDashboardService.getOverview()`.
- Subdiretório: [components](./components/EGM.md) - componentes de gráfico/cartões alimentados por `cdrsInput`.

## Invariants
- "Minhas Chamadas" só busca no backend se `MyCallsStateService.loaded()` for falso; o estado é resetado ao entrar/sair do gerenciamento de outra empresa.
- Na tabela de "Minhas Chamadas", chamadas `userfield === 'OUTBOUND'` exibem o `peer` como origem; o centro de custo é resolvido pelo primeiro `AccountCode` de cada `code`.
- `PeerDashboard.canCall` exige webphone JsSIP habilitado e impede ligar para o próprio ramal; `callPeer` não liga se já houver sessão ativa (mostra aviso).
- Métricas de fila: nível de serviço = `answeredCallsInServiceLevel / answeredCalls` (1 casa decimal), `null` sem atendidas; severidade `ok` >= 80, `warn` >= 60, `critical` abaixo; alerta `SLA_CRITICAL` abaixo de 60 e `TME_HIGH` quando `tmeSeconds > queue.tmeAlertSeconds`; filas sem chamadas não geram alertas.
- Membros presentes em várias filas são contados uma vez (`uniqueMembers`); o limite de chamada longa é o menor `callDurationAlertMinutes` entre as filas do membro.
- `WorkersDashboard` faz polling a cada 3 ticks de 1 s (`TICK_MS`, `TICKS_PER_REFRESH`), pula quando a aba está oculta e atualiza ao voltar a ficar visível.

## Side Effects
- HTTP: `GET /cdrs/mine` (via `ReportService`), `GET /accounts` (via `AccountCodeService`), `GET /callstates/peerregistries`, `GET /queues/states`, `GET /dac-report/today-hourly` (a cada 60 s), `DELETE /queues/states/{queueId}/members/{memberId}/logout`, `GET /callstates/workers/overview`.
- STOMP: `/topic/peerregistries/{companyId}`, `/topic/peerregistries-removed/{companyId}`, `/topic/queuestates/{companyId}`, `/topic/queues-removed/{companyId}`; `PeerDashboard` e `QueueDashboard` fornecem a própria instância de `WebsocketService`.
- `localStorage['peer-dashboard-view-mode']` guarda o modo de visualização do painel de ramais.
- `callPeer` abre a sidebar do webphone e inicia chamada SIP.
- Timers `setInterval`, limpos em `ngOnDestroy`.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
