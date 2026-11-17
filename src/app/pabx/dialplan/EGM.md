# pabx/dialplan

## Overview
Regras de discagem (dialplan) do PABX: listagem com busca, ajuste de prioridade, ativação/desativação em lote e exclusão; serviço HTTP e helpers de opções/ordenação. Criação e edição ficam nos subdiretórios.

## Interface
- `DialPlanService` (`dial-plan.service.ts`): `findAll()`, `findById(id)`, `create(dialplan)`, `update(dialplan)`, `updatePriority(dialplan)`, `updateActive(ids, isActive)`, `delete(id)`.
- `DialplanPage` (`app-dialplan-page`, rota `pabx/dialplans`): `srcLabel`, `dstLabel`, `visibleDialplans()`, `onChangePriority(dialplan)`, `toggleSelectionMode()`, `updateSelectedActive(isActive)`, `confirmDelete(dialplan)`; `priorityOptions` de 0 a 4.
- `utils.ts`: `dialplanSrcOptions()`, `dialplanSrcLabel(srcEnum)`, `dialplanActionOptions()`, `calendarActionOptions()`, `dialplanDstLabel(dialplan, aliasNames)`, `matchesDialplanSearch(dialplan, text, aliasNames)`, `sortDialplansByDstAndPriority(dialplans, aliasNames)`.
- Subdiretórios:
  - [components](./components/EGM.md) - editores de argumentos por tipo de ação e seletores de ramal/alias/tronco.
  - [new-dialplan](./new-dialplan/EGM.md) - formulário de criação.
  - [edit-dialplan](./edit-dialplan/EGM.md) - formulário de edição.

## Invariants
- A origem (`SrcEnum`: `ANY`, `PEER`, `ALIAS`, `EXPRESSION`, `TRUNK`) usa `srcValue`; para `PEER` e `TRUNK`, `srcValue == 'ANY'` significa todos.
- Tipos de ação (`DialPlanActionEnum`): `ANSWER`, `HANGUP`, `PLAYBACK`, `SET_VARIABLE`, `DIAL_ROUTE`, `DIAL_PEER`, `ACCOUNT_CODE`, `EDIT_DST`, `CALENDAR`, `CALL_GROUP`, `URA`, `QUEUE`.
- O destino de uma regra é `dst` (expressão) ou `dstAlias` (id de alias); `dialplanDstLabel` mostra `dst` ou o nome do alias (cai para o id se o alias não for encontrado).
- `sortDialplansByDstAndPriority`: expressões antes de aliases, depois destino em ordem `localeCompare('pt-BR', { numeric: true })` e, para o mesmo destino, prioridade decrescente. A prioridade da regra só desempata regras com o mesmo destino.
- `sortDialplansByDstAndPriority` ordena o array recebido no lugar (`Array.prototype.sort`).
- Mudar a prioridade reordena a lista localmente e persiste por endpoint dedicado (`PUT /dialplans/{id}/priority`); ativação em lote usa `PUT /dialplans/active` com `{ ids, isActive }`.
- A busca considera o nome e o destino exibido (`matchesDialplanSearch`, sem diferenciar maiúsculas, locale `pt-BR`).

## Side Effects
- HTTP: `GET|POST /dialplans`, `GET|PUT|DELETE /dialplans/{id}`, `PUT /dialplans/{id}/priority`, `PUT /dialplans/active`; a listagem também carrega aliases (`AliasService.findAll`) e opções de tronco (`TrunkService.findOptions`).

## Verification
- Run: `npm test` (na raiz de `frontend/`)
