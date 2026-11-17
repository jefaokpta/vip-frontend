# pabx/dac-report

## Overview
Relatório DAC (distribuição automática de chamadas) por fila: totais, atendidas/abandonadas, parciais por hora ou dia e drill-down para a jornada de cada chamada, com gravação sob demanda.

## Interface
- `DacReportService` (`dac-report.service.ts`): `findQueues()`, `findReport(queueId, start, end)`, `findCalls(queueId, start, end)`, `findRecordingUrl(queueId, uniqueId, memberPeer): Promise<string>`.
- `DacReportStateService` (`dac-report-state.service.ts`): `selectedQueue`, `dateRange`, `report`, `loaded`, `setReport`, `reset`.
- `DacReportPage` (`app-dac-report-page`, rota `pabx/dac-report`): `onQueueSelect`, `onDateSelect`, `onClearDate`, `loadReport`, helpers de percentual e `detailsQueryParams(partial, r)`.
- `DacReportCallsPage` (`app-dac-report-calls-page`, rota `pabx/dac-report-calls`): `loadCalls`, `goBack`, `onRowExpand`, `onRowCollapse`, `playRecording(call)`, `formatDateTime`.
- `dac-report.utils.ts`: `formatHms`, `percentSeverity`, `answeredPercent`, `abandonedPercent`, `eventLabel`, `eventSeverity`.

## Invariants
- Ao escolher a fila, o intervalo padrão é o dia de hoje (00:00 a 23:59:59.999); o intervalo máximo é de 31 dias a partir da data inicial, limitado a hoje.
- A página de jornada recebe `queueId`, `queueName`, `start`, `end` e `granularity` por query params (`detailsQueryParams`).
- A URL da gravação só é buscada se a chamada tiver `hasRecording` e `answeredByPeer`, e fica em cache por `uniqueId` na página.
- O estado do relatório fica em `DacReportStateService` (root) e é resetado ao entrar/sair do gerenciamento de outra empresa.
- Timeout de 10 s em todas as consultas.

## Side Effects
- HTTP: `GET /dac-report/queues`, `GET /dac-report/{queueId}?start&end`, `GET /dac-report/{queueId}/calls?start&end`, `GET /dac-report/{queueId}/calls/{uniqueId}/recording-url?memberPeer`.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
