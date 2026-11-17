# pabx/ura-report

## Overview
Relatório de estatísticas de URA: seleções de opção feitas pelos chamadores, últimas ou por intervalo de datas, com gráfico por opção.

## Interface
- `UraReportService` (`ura-report.service.ts`): `findLastSelections(uraId)`, `findByDateRange(uraId, start, end)`.
- `UraReportPage` (`app-ura-report-page`, rota `pabx/ura-report`): `onUraSelect`, `onDateSelect`, `onClearDate`, `optionLabel(optionDigit)`, `formatDate`.
- `uraOptionLabel(optionDigit, ura)` (`ura-option.ts`).

## Invariants
- `uraOptionLabel`: o dígito de `invalidAction` vira `Opção inválida`, o de `timeoutAction` vira `Tempo esgotado`; os demais viram `"<dígito> - <descrição>"` ou só o dígito sem descrição.
- Mesmas regras de intervalo do relatório de pesquisa: data mínima 2 meses atrás, intervalo máximo de 2 meses, fim ajustado para 23:59:59.999.

## Side Effects
- HTTP: `GET /uras/{uraId}/selections/last`, `GET /uras/{uraId}/selections?start&end`; a lista de URAs vem de `UraService.findAll`.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
