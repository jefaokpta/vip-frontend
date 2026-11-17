# pabx/route

## Overview
CRUD de rotas de chamada de saída: cada rota tem linhas com até três troncos (principal e alternativos).

## Interface
- `RouteService` (`route.service.ts`): `findAll()`, `findById(id)`, `create(route)`, `update(route)`, `delete(id)`.
- `RoutePage` (`app-route-page`): `confirmDelete(route)`.
- `NewRoutePage` (`app-new-route-page`), `EditRoutePage` (`app-edit-route-page`).
- `route-trunks.ts`: `TrunkRow` (`trunk1`, `trunk2`, `trunk3`), `withClearedTrunksAsZero(route)`.
- Rotas: `routes`, `routes/new`, `routes/edit/:id`.

## Invariants
- O backend espera `0` para "sem tronco"; o botão de limpar do `p-select` gera `null`, por isso o payload deve passar por `withClearedTrunksAsZero` antes de salvar.

## Side Effects
- HTTP: `GET|POST /routes`, `GET|PUT|DELETE /routes/{id}`; os formulários carregam troncos via `TrunkService`.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
