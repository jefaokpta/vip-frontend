# pabx/accountcode

## Overview
CRUD de centros de custo (`AccountCode`), usados para classificar chamadas nos relatórios e na ação de dialplan de centro de custo.

## Interface
- `AccountCodeService` (`account-code.service.ts`): `findAll()`, `findById(id)`, `create(accountCode)`, `update(accountCode)`, `delete(id)`.
- `AccountCodePage` (`app-account-code-page`): `isDeletable(accountCode)`, `confirmDelete(accountCode)`.
- `NewAccountCodePage` (`app-new-account-code-page`), `EditAccountCodePage` (`app-edit-account-code-page`).
- Rotas (em `pabx.routes.ts`): `accountcodes`, `accountcodes/new`, `accountcodes/edit/:id`.

## Invariants
- Centros de custo cujo `code` tem `'00'` no segundo segmento (`code.split('.')[1] === '00'`) não podem ser excluídos pela UI (`isDeletable`).
- Após salvar, as páginas de formulário voltam para `/pabx/accountcodes`.

## Side Effects
- HTTP: `GET|POST /accounts`, `GET|PUT|DELETE /accounts/{id}`.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
