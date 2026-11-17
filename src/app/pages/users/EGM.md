# pages/users

## Overview
Gestão de usuários da empresa (lista, criação, edição) e o `UserService`, fonte central de identidade do app: token JWT, usuário logado, roles/módulos, gerenciamento de outra empresa e registro do ramal do webphone.

## Interface
- Rotas (`users.routes.ts`): `''` → `UsersPage`, `new` → `NewUserPage`, `edit/:id` → `EditUserPage` com `canActivate: [manageUserGuard]`.
- `UserService` (`user.service.ts`, `providedIn: 'root'`):
  - Sessão: `getUser()`, `getUserSignal()`, `loginSuccess(token)`, `logout()`, `refreshToken()`, `authenticate(email, password)`, `hasModule(module)`, `hasService(service)`, `isUserExpired(user)`.
  - Gerenciar empresa: `manageOtherCompany(companyId)`, `exitManageCompany()`.
  - Perfil e preferências: `updateProfile(profile)`, `setUserSettings(darkMode?)`, `getUserSettings()`.
  - Webphone: `isWebphoneActivatedSignal()`, `webphoneJsSipEnabledSignal()`, `getWebphoneRegisterSignal()`, `setWebphoneRegistration(r)`, `updateWebphoneRegistration(r)`, `deactivateWebphoneRegistration()`.
  - CRUD/contas: `findAll()`, `findById(id)`, `create(user)`, `update(user)`, `delete(id)`, `resendConfirmation(email)`, `forgotPassword(email)`, `confirmEmail(c)`, `setPassword(p)`.
- `utils.ts`: `translateRole(role)`, `buildRoleOptions(userRoles)`, `translateModule(module)`, `buildModuleOptions(companyServices)`, `canManageUser(loggedRoles, targetRoles)`.
- Páginas: `UsersPage` (`app-users`: `resendConfirmation`, `confirmDelete`, `canManage`), `NewUserPage` (`app-new-user`), `EditUserPage` (`app-edit-user`).

## Invariants
- O usuário é sempre derivado do JWT em `localStorage['token']` via `jwtDecode`; `email` vem de `sub`; `companyServices` e `modules` default `[]`. Sem token, retorna um usuário vazio com `isExpired: true`.
- Toda resposta que devolve token (`manageOtherCompany`, `exitManageCompany`, `updateProfile`, `refreshToken`) substitui o token em `localStorage` e atualiza o signal do usuário.
- `isUserExpired`: usuário com mais de uma role nunca expira; com uma única role expira 5 dias após `createdAt`.
- `webphoneJsSipEnabled` só é verdadeiro com `endpoint` e `peerTransportEnums` contendo `PeerTransportEnum.WSS`.
- `canManageUser`: o nível é o maior índice das roles em `RoleEnum`; só gerencia alvos com nível menor ou igual ao do logado.
- Formulários de usuário exigem `name`, `email` (`Validators.email`) e `role` (default `ROLE_COMPANY_USER`).

## Side Effects
- HTTP para `environment.API_BACKEND_URL`: `POST /auth/login`, `GET /security/validate`, `POST /users/manage`, `POST /users/manage/exit`, `PUT /users/profile`, `GET|PUT|DELETE /users/webphone`, `GET|POST|PUT /users`, `GET|DELETE /users/{id}`, `POST /users/admin/resend-confirmation`, `POST /auth/forgot-password`, `POST /auth/confirmation`, `POST /users/password`.
- `UserService` busca o registro do webphone (`GET /users/webphone`) no construtor e em `loginSuccess`.
- `localStorage`: `token` (leitura/escrita/remoção) e `settings` (`{ darkMode }`).
- `logout()` define `globalThis.location.href = '/'` (recarga completa).

## Verification
- Run: `npm test` (na raiz de `frontend/`)
