# pages

## Overview
Páginas gerais da área autenticada (montadas em `/pages`): administração de empresas, tenants, usuários e IPs bloqueados, perfil do usuário, painéis em tempo real e a página de facilidades do PABX. Também contém as páginas `Notfound` e `Empty`.

## Interface
- Rotas (`pages.routes.ts`, export default):
  - `companies`, `tenants`, `blocked-ips`, `users`: lazy (`loadChildren`) para os subdiretórios.
  - `profile` → `PersonPage`.
  - `peers` → `PeerDashboard` com `moduleGuard(ModuleEnum.PABX)`.
  - `queues` → `QueueDashboard` com `moduleGuard(ModuleEnum.PABX)` e `roleGuard(RoleEnum.ROLE_COMPANY_SUPERVISOR)`.
  - `queue-login` → `QueueLoginPage`, `pabx-features` → `PabxFeaturesPage`, `workers` → `WorkersDashboard`, `**` → `/notfound`.
- `PersonPage` (`person.page.ts`): edição de perfil (`name`, `email`) e troca opcional de senha (`togglePasswordChange`, `onSubmit`).
- `Notfound` (`app-notfound`, `notfound.ts`), `Empty` (`app-empty`, `empty.ts`).
- Subdiretórios:
  - [blocked-ip](./blocked-ip/EGM.md) - lista de bloqueio de IPs.
  - [company](./company/EGM.md) - CRUD de empresas e "gerenciar empresa".
  - [dashboard](./dashboard/EGM.md) - "Minhas Chamadas" e painéis de ramais, filas e workers.
  - [pabx-features](./pabx-features/EGM.md) - documentação estática dos códigos de facilidade.
  - [queues](./queues/EGM.md) - login/pausa do agente nas filas.
  - [tenant](./tenant/EGM.md) - CRUD de tenants.
  - [users](./users/EGM.md) - usuários e o `UserService` central.
  - [utils](./utils/EGM.md) - validadores de senha.

## Invariants
- Só `peers` e `queues` aplicam guard de módulo/role nesta tabela; as demais rotas dependem do `authGuard` da rota pai e da visibilidade do menu. A edição de usuário é protegida por `manageUserGuard` em `users.routes.ts`.
- `PersonPage`: ao ativar troca de senha, cria dois controles (`passwordArray`): senha atual (`minLength(8)`) e nova senha (`minLength(8)` + `passwordStrengthValidator()`).

## Side Effects
- `PersonPage.onSubmit` chama `UserService.updateProfile` (`PUT /users/profile`), que substitui o token em `localStorage`.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
