# pabx/register-instance

## Overview
CRUD de instâncias de *register* do PABX (nome, DNS e IP interno). Acessível pelo menu a `ROLE_SAAS_SUPPORT`.

## Interface
- `RegisterInstanceService` (`register-instance.service.ts`): `findAll()`, `findById(id)`, `create(x: NewRegisterInstance)`, `update(id, x: NewRegisterInstance)`, `delete(id)`.
- `RegisterInstancePage` (`register-instance.page.ts`): listagem e `confirmDelete`.
- `RegisterInstanceFormPage` (`register-instance-form.page.ts`): um único formulário para criar (`register-instances/new`) e editar (`register-instances/edit/:id`).
- Rotas: `register-instances`, `register-instances/new`, `register-instances/edit/:id`.

## Invariants
- `name` segue `NAME_PATTERN = /^[A-Za-z0-9_-]{1,11}$/`; `dns` e `internalIp` seguem `HOST_PATTERN = /^[A-Za-z0-9.-]{1,253}$/`.
- Após salvar, navega para `/pabx/register-instances`.

## Side Effects
- HTTP: `GET|POST /registers`, `GET|PUT|DELETE /registers/{id}`.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
