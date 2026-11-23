# pabx/dialplan/edit-dialplan

## Overview
Formulário de edição de regra de discagem existente, incluindo a prioridade da regra e a lista ordenável de ações.

## Interface
- `EditDialplanPage` (`app-edit-dialplan-page`, `edit-dialplan.page.ts` + `edit-dialplan.page.html`): `manageSrcValue(dialplan?)`, `addAction()`, `removeDialplanAction(index)`, `onRowReorder()`, `onSubmit()`.
- Rota: `pabx/dialplans/edit/:id`.

## Invariants
- As ações carregadas são ordenadas por `priority` crescente; ao salvar, a `priority` de cada ação é regravada como o índice na tabela.
- `priority` da regra é obrigatória no formulário de edição.
- `SET_VARIABLE` exige `arg2`; `arg3` recebe default/validadores de `actionArg3DefaultValue`/`actionArg3Validators` (para `DIAL_PEER`, tempo de toque 5-300 s, default `'30'`).
- `srcValue` só existe quando `srcEnum` é diferente de `ANY`.
- Após salvar, navega para `/pabx/dialplans`.

## Side Effects
- HTTP: `GET /dialplans/{id}` e `PUT /dialplans/{id}` (via `DialPlanService`).

## Verification
- Run: `npm test` (na raiz de `frontend/`)
