# pabx/dialplan/new-dialplan

## Overview
Formulário de criação de regra de discagem (dialplan): origem, destino (expressão ou alias), ativação e lista ordenável de ações.

## Interface
- `NewDialplanPage` (`app-new-dialplan-page`, `new-dialplan.page.ts` + `new-dialplan.page.html`): `manageSrcValue()`, `addDialplanAction()`, `removeDialplanAction(index)`, `onRowReorder()`, `onSubmit()`.
- Rota: `pabx/dialplans/new`.

## Invariants
- `srcValue` só existe (e é obrigatório) quando `srcEnum` é diferente de `ANY`.
- A `priority` de cada ação é o índice dela na tabela no momento do envio.
- O formulário não define a `priority` da regra (a regra nasce com a prioridade padrão do backend); a prioridade só é ajustada depois na listagem.
- Regras nascem com `isActive = true`.
- Validação dos argumentos por ação vem de `actionHasArg1`, `actionArg2HasDefaultValue`, `actionArg3DefaultValue` e `actionArg3Validators` (`@/pabx/utils`).
- Após salvar, navega para `/pabx/dialplans`.

## Side Effects
- HTTP: `POST /dialplans` (via `DialPlanService.create`).

## Verification
- Run: `npm test` (na raiz de `frontend/`)
