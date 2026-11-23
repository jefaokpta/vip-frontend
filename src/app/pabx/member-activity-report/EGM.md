# pabx/member-activity-report

## Overview
Relatório de atividade dos membros de uma fila: sessões de login, pausas, produtividade e linha do tempo da jornada por membro.

## Interface
- `MemberActivityReportService` (`member-activity-report.service.ts`): `findQueues()`, `findReport(queueId, start, end): Promise<MemberActivityReportResponse>`.
- `MemberActivityReportPage` (`app-member-activity-report-page`, rota `pabx/member-activity-report`): `onQueueSelect`, `onDateSelect`, `onClearDate`, `loadReport`, formatadores (`formatDuration`, `formatTime`, `formatSessionRange`, `formatPauseRange`) e classes de produtividade (`productivityBand`: `high` >= 80%, `mid` >= 60%, senão `low`).

## Invariants
- O intervalo consultado vai de 00:00 do primeiro dia a 23:59:59.999 do último.
- Sessão sem saída (`saida === null`) é exibida com `—`; pausa sem fim (`end === null`) é exibida como `em andamento`.
- Timeout de 10 s nas consultas; `start`/`end` vão como epoch em ms.

## Side Effects
- HTTP: `GET /member-activity-report/queues`, `GET /member-activity-report/{queueId}?start&end`.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
