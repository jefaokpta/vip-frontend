# pabx/report

## Overview
Relatório de chamadas (CDRs) com filtros, gráfico por hora/dia e detalhe da chamada com interações, gravações e transcrições de IA. Também fornece funções puras de formatação, estatística e gráficos reutilizadas por outros painéis e relatórios.

## Interface
- `ReportService` (`report.service.ts`): `findLast30()`, `findMine()`, `findByDateRange(start, end)`, `findById(id): Promise<CdrDetail>`.
- `TranscriptionService` (`transcription.service.ts`): `findByCdr(uniqueId): Promise<Transcription[]>` no backend de IA.
- `ReportStateService` (`report-state.service.ts`): signals `dateRange`, `statusFilter`, `costCenterFilter`, `searchText`; `cdrs`, `loaded` (readonly); `setCdrs(cdrs)`, `reset()`.
- `ReportPage` (`app-report-page`, rota `pabx/call-report`): `onDateSelect()`, `onClearDate()`.
- `ReportDetailPage` (`app-report-detail-page`): rota `calls/:id` (em `app.routes.ts`; `pabx/call-report/detail/:id` redireciona para ela).
- `cdr-format.ts`: `formatDate`, `formatDuration`, `dispositionSeverity`, `costCenterLabel`, `dispositionTranslate`.
- `cdr-stats.ts`: `avgDurationSeconds`, `answerRate`, `totalTalkSeconds`.
- `cdr-chart.ts`: `ChartBucket`, `bucketKey`, `hourlyBuckets`, `dailyBuckets`, `buildCallsChart`.
- `count-bar-chart.ts`: `CountBar`, `buildCountBarChart`, `answerBars`, `unansweredCount` (`buildCountBarChart` é usado pelos relatórios de URA e pesquisa; `answerBars` pelo de pesquisa).

## Invariants
- Os filtros e os CDRs carregados ficam em `ReportStateService` (root) e sobrevivem à navegação; `ReportPage` só busca os últimos 30 dias se `loaded()` for falso. O estado é resetado ao entrar/sair do gerenciamento de outra empresa.
- Intervalo de datas: no máximo 2 meses a partir da data inicial, limitado a hoje; o fim do intervalo é ajustado para 23:59:59.999; trocar o intervalo limpa os filtros de status e centro de custo.
- `costCenterFilter`: `null` = todos, `''` = chamadas sem centro de custo.
- Consultas de CDR usam timeout de 10 s; `start`/`end` vão como epoch em ms.
- `ReportDetailPage` volta para `/pabx/call-report` quando aberta com `?from=call-report`.

## Side Effects
- HTTP (`API_BACKEND_URL`): `GET /cdrs/last`, `GET /cdrs/mine`, `GET /cdrs?start&end`, `GET /cdrs/{id}`, `GET /accounts`.
- HTTP (`IA_BACKEND_URL`): `GET /transcriptions/by-cdr/{uniqueId}`.
- Reprodução de gravações via `<audio>` com `recordingUrl` da interação.
- Gráficos leem variáveis CSS do documento.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
