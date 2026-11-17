# pages/tenant

## Overview
CRUD de tenants (agrupadores de empresas com uma empresa primária).

## Interface
- Rotas (`tenant.routes.ts`): `''` → `TenantPage`, `new` → `NewTenantPage`, `edit/:id` → `EditTenantPage`.
- `TenantService` (`tenant.service.ts`): `findAll()`, `findById(id)`, `create(tenant: NewTenant)`, `update(id, tenant: NewTenant)`, `delete(id)`.
- `TenantPage` (`app-tenant-page`): `primaryCompanyLabel(tenant)`, `confirmDelete(tenant)`.
- `NewTenantPage` (`app-new-tenant`), `EditTenantPage` (`app-edit-tenant`).

## Invariants
- `name` e `primaryCompanyId` são obrigatórios nos formulários.

## Side Effects
- HTTP: `GET|POST /tenants`, `GET|PUT|DELETE /tenants/{id}`.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
