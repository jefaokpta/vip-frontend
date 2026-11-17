# pabx/pause

## Overview
CRUD de motivos de pausa dos agentes de fila, com limite de tempo opcional.

## Interface
- `PauseService` (`pause.service.ts`): `findAll()`, `findById(id)`, `create(pause)`, `update(pause)`, `delete(id)`.
- `PausePage` (`app-pause-page`): `confirmDelete(pause)`.
- `NewPausePage` (`app-new-pause-page`), `EditPausePage` (`app-edit-pause-page`).
- Rotas: `pauses`, `pauses/new`, `pauses/edit/:id`.

## Invariants
- `timeLimitMinutes` é obrigatório e >= 0 (default 0); os painéis só alertam pausa longa quando o limite é maior que 0.

## Side Effects
- HTTP: `GET|POST /pauses`, `GET|PUT|DELETE /pauses/{id}`.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
