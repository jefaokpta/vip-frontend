# pabx/pickup-group

## Overview
CRUD de grupos de captura (departamentos): nome do grupo e ramais associados. O nome também é usado para agrupar ramais no painel de ramais.

## Interface
- `PickupGroupService` (`pickup-group.service.ts`): `findAll()`, `findById(id)`, `create(name)`, `update(id, name)`, `assignPeers(id, peerIds)`, `delete(id)`.
- `PickupGroupsPage` (`app-pickup-groups-page`): `confirmDelete(group)`.
- `NewPickupGroupPage`, `EditPickupGroupPage`.
- `PickupGroupPeersComponent` (`app-pickup-group-peers`): `@Input() groupId?`, `moveToSelected`, `moveToAvailable`, `selectedPeerIds()`.
- Rotas: `pickup-groups`, `pickup-groups/new`, `pickup-groups/edit/:id`.

## Invariants
- Nome e ramais são persistidos em chamadas separadas: `create`/`update` levam só `{ name }`; a associação de ramais é feita por `assignPeers` (`PUT /pickup-groups/{id}/peers` com array de ids).
- O PickList usa `transferPickListItems`.

## Side Effects
- HTTP: `GET|POST /pickup-groups`, `GET|PUT|DELETE /pickup-groups/{id}`, `PUT /pickup-groups/{id}/peers`.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
