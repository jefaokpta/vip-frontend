# pages/company

## Overview
Administração de empresas (clientes da plataforma): listagem, criação, edição de dados e serviços contratados, exclusão com confirmação por nome e entrada no modo "gerenciar empresa".

## Interface
- Rotas (`company.routes.ts`): `CompanyShellComponent` (`app-company-shell`) com `providers: [MessageService]` e filhos `''` → `CompanyPage`, `new` → `NewCompanyPage`, `edit/:id` → `EditCompanyPage`.
- `CompanyService` (`company.service.ts`): `findCompanyId(companyId)`, `findAll()`, `create(company: NewCompany)`, `update(company)`, `updateServices(companyId, services)`, `delete(companyId)`.
- `CompanyPage` (`app-company-page`): `manageCompany(companyId)`, `openDelete`, `closeDelete`, `canConfirmDelete()`, `confirmDelete()`.
- `EditCompanyPage` (`app-edit-company`): `hasService`, `onToggleService(service, enabled, toggle)`, `onSubmit()`.
- `NewCompanyPage` (`app-new-company`): `onSubmit()`.

## Invariants
- O `MessageService` é fornecido no nível da rota (shell) para que o toast criado em `NewCompanyPage` sobreviva à navegação para a lista.
- Exclusão só é confirmada quando o nome digitado é igual a `company.name` (`canConfirmDelete`).
- Validações: `companyId` com 6 dígitos (`^[0-9]{6}$`) na edição; `cnpj` no padrão `XX.XXX.XXX/XXXX-NN` (alfanumérico nos blocos iniciais).
- `create` e `delete` usam timeout estendido (`LONG_TIMEOUT = 60_000`) por serem operações longas no backend.
- Ao gerenciar outra empresa, `ReportStateService`, `DacReportStateService` e `MyCallsStateService` são resetados antes de navegar para `/`.
- Os serviços da empresa são alterados individualmente por toggle via `updateServices`, separados do update dos dados cadastrais.

## Side Effects
- HTTP: `GET /companies`, `GET|PUT|DELETE /companies/{companyId}`, `PUT /companies/{companyId}/services`, `POST /companies`.
- `manageCompany` chama `UserService.manageOtherCompany` (`POST /users/manage`), que troca o token em `localStorage`.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
