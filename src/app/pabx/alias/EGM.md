# pabx/alias

## Overview
CRUD de "Alias de Discagem": nome associado a uma lista de expressões de discagem, usado como destino reutilizável nas regras de dialplan.

## Interface
- `AliasService` (`alias.service.ts`): `findAll()`, `findById(id)`, `create(alias)`, `update(alias)`, `delete(id)`.
- `AliasPage` (`app-alias-page`): `confirmDelete(alias)`.
- `NewAliasPage` (`app-new-alias-page`) e `EditAliasPage` (`app-edit-alias-page`): `addExpression()`, `removeExpression(index)`, `onSubmit()`.
- Tipos: `Alias`, `AliasExpression` (`@/pabx/types`).
- Rotas: `aliases`, `aliases/new`, `aliases/edit/:id`.

## Invariants
- As expressões são editadas como `FormArray`; o alias é referenciado em dialplans por id (`DialPlan.dstAlias`).
- Após salvar, navega para `/pabx/aliases`.

## Side Effects
- HTTP: `GET|POST /aliases`, `GET|PUT|DELETE /aliases/{id}`.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
