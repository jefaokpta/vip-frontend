# pabx/trunk

## Overview
CRUD de troncos SIP (conexões com operadoras): credenciais, host/porta, codecs, DTMF, idioma, limite de chamadas e configurações extras livres.

## Interface
- `TrunkService` (`trunk.service.ts`): `findAll()`, `findOptions(): Promise<TrunkOption[]>`, `findById(id)`, `create(trunk)`, `update(trunk)`, `delete(id)`.
- `TrunkPage` (`app-trunk-page`): `confirmDelete(trunk)`.
- `NewTrunkPage` (`app-new-trunk-page`) e `EditTrunkPage` (`app-edit-trunk-page`): `addExtraConfig(param?)`, `removeExtraConfig(index)`, `onSubmit()`.
- Rotas: `trunks`, `trunks/new`, `trunks/edit/:id`.

## Invariants
- Troncos pertencem ao SBC e valem para todas as empresas; `Trunk.companyId` só registra a empresa que criou (a edição apenas carrega `companyId` num controle do formulário).
- `TrunkOption` (`id`, `name` via `GET /trunks/options`) é a visão mínima acessível a `COMPANY_ADMIN` (comentário em `types/trunk.ts`); a lista completa é de suporte SaaS (menu com `ROLE_SAAS_SUPPORT`).
- `extraConfigs` é um `FormArray` de pares de configuração livres (`ExtraConfig`).

## Side Effects
- HTTP: `GET|POST /trunks`, `GET /trunks/options`, `GET|PUT|DELETE /trunks/{id}`.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
