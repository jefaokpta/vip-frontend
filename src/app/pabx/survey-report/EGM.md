# pabx/survey-report

## Overview
Relatório de respostas de uma pesquisa de satisfação: últimas respostas ou por intervalo de datas, com médias e gráficos de distribuição de notas.

## Interface
- `SurveyReportService` (`survey-report.service.ts`): `findLastResponses(surveyId)`, `findByDateRange(surveyId, start, end)`.
- `SurveyReportPage` (`app-survey-report-page`, rota `pabx/survey-report`): `onSurveySelect`, `onDateSelect`, `onClearDate`, `averageLabel`, `formatDate`. Usa `buildCountBarChart` e `answerBars` de [`../report/EGM.md`](../report/EGM.md).

## Invariants
- Sem intervalo, carrega as últimas respostas; com intervalo, a data mínima é 2 meses antes de hoje, o intervalo máximo é de 2 meses a partir da data inicial, e o fim é ajustado para 23:59:59.999.

## Side Effects
- HTTP: `GET /surveys/{surveyId}/responses/last`, `GET /surveys/{surveyId}/responses?start&end`; a lista de pesquisas vem de `SurveyService.findAll`.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
