# security

## Overview
Guards funcionais de rota (`CanActivateFn`) que controlam autenticação, módulos contratados, roles e hierarquia na edição de usuários. Todos dependem de `UserService` (`@/pages/users/user.service`).

## Interface
- `authGuard: CanActivateFn` (`auth-guard.ts`): `await userService.refreshToken()`; se `!user.isPasswordCreated`, navega para `/auth/newpassword` com `email` e retorna `false`; em erro retorna `UrlTree` para `/auth/login?returnUrl=<url>`.
- `moduleGuard(module: ModuleEnum): CanActivateFn` (`module-guard.ts`): permite se `userService.hasModule(module)`; senão `UrlTree` para `/`.
- `roleGuard(role: RoleEnum): CanActivateFn` (`role-guard.ts`): permite se `getUser().roles.includes(role)`; senão `UrlTree` para `/`.
- `manageUserGuard: CanActivateFn` (`manage-user-guard.ts`): carrega o usuário alvo por `route.paramMap.get('id')` e permite só se `canManageUser(logado.roles, alvo.roles)`; senão (ou em erro) `UrlTree` para `/pages/users`.

## Invariants
- `authGuard` valida o token no backend a cada ativação da rota raiz (via `refreshToken`); não confia só no JWT local.
- `roleGuard` exige a role exata informada (não aplica hierarquia); a hierarquia só é aplicada por `manageUserGuard` via `canManageUser`.
- Guards negados retornam `UrlTree` (exceto o caso de senha não criada em `authGuard`, que navega e retorna `false`).

## Side Effects
- `authGuard`: requisição HTTP `GET /security/validate` (via `UserService.refreshToken`) e gravação do token renovado em `localStorage['token']`.
- `manageUserGuard`: requisição HTTP `GET /users/{id}`.
- Navegação do roteador.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
