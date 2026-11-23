# pabx/worker-instance

## Overview
CRUD de instâncias de *worker* do PABX (nome, DNS e IP interno), incluindo o toggle de prontidão. Acessível pelo menu a `ROLE_SAAS_SUPPORT`.

## Interface
- `WorkerInstanceService` (`worker-instance.service.ts`): `findAll()`, `findById(id)`, `create(x: NewWorkerInstance)`, `update(id, x: NewWorkerInstance)`, `updateReady(id, ready)`, `delete(id)`.
- `WorkerInstancePage` (`worker-instance.page.ts`): listagem e `confirmDelete`, `onToggleReady(worker, checked)`.
- `WorkerInstanceFormPage` (`worker-instance-form.page.ts`): um único formulário para criar (`worker-instances/new`) e editar (`worker-instances/edit/:id`).
- Rotas: `worker-instances`, `worker-instances/new`, `worker-instances/edit/:id`.

## Invariants
- `name` segue `NAME_PATTERN = /^[A-Za-z0-9_-]{1,11}$/`; `dns` e `internalIp` seguem `HOST_PATTERN = /^[A-Za-z0-9.-]{1,253}$/`.
- Após salvar, navega para `/pabx/worker-instances`.

## Side Effects
- HTTP: `GET|POST /workers`, `GET|PUT|DELETE /workers/{id}`, `PATCH /workers/{id}/ready/{ready}`.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
