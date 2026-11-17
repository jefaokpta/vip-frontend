# pabx/call-group

## Overview
CRUD de grupos de chamada (ramais que tocam juntos ou em sequência conforme a estratégia).

## Interface
- `CallGroupService` (`call-group.service.ts`): `findAll()`, `findById(id)`, `create(body)`, `update(id, body)`, `delete(id)`.
- `CallGroupsPage` (`app-call-groups-page`): `strategyLabel(strategy)`, `confirmDelete(group)`.
- `NewCallGroupPage` (`app-new-call-group-page`) e `EditCallGroupPage` (`app-edit-call-group-page`): `onSubmit()`, `moveToSelected(items: Peer[])`, `moveToAvailable(items: Peer[])`.
- Rotas: `call-groups`, `call-groups/new`, `call-groups/edit/:id`.

## Invariants
- A seleção de ramais usa PickList; os lados são reconstruídos com `transferPickListItems` (`@/util/utils`).
- Estratégias vêm de `CallGroupStrategyEnum`.

## Side Effects
- HTTP: `GET|POST /call-groups`, `GET|PUT|DELETE /call-groups/{id}`; os formulários também carregam ramais via `PeerService` e áudios via `MohService`.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
