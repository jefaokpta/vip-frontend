# layout/components

## Overview
Casca visual da área autenticada: `AppLayout` (componente da rota raiz), menu lateral filtrado por role e módulo, topbar, breadcrumb, sidebar de perfil, configurador de tema e diálogo de ativação de ramal do webphone.

## Interface
- `AppLayout` (`app-layout`, `app.layout.ts`): componente de `path: ''` em `app.routes.ts`; fecha menus em clique externo e em `NavigationEnd`.
- `AppMenu` (`app-menu`, `app.menu.ts`): `model` estático e `filteredModel` calculado por `filterByRole`.
- `AppMenuitem` (`[app-menuitem]`): `@Input() item`, `index`, `root`, `parentKey`.
- `AppTopbar` (`[app-topbar]`): `exitManagingCompany()`, `activePeerNumber()`, `openWhatsApp()`, botões de menu/perfil/config e dark mode.
- `AppSidebar` (`[app-sidebar]`), `AppBreadcrumb` (`[app-breadcrumb]`), `AppProfileSidebar` (`[app-profilesidebar]`, `logout()`), `AppConfigurator` (`app-configurator`, `@Input() simple`).
- `ActivatePeerDialogComponent` (`app-activate-peer-dialog-component`): `@Input() isPeerFormDialogVisible`, `@Output() isPeerFormDialogVisibleChange`; `onSubmit()` ativa o ramal do webphone.

## Invariants
- `filterByRole` filtra recursivamente: item com `roles` só aparece se o usuário tiver ao menos uma delas; item com `module` exige `userService.hasModule(module)`; grupos sem filhos após o filtro são removidos.
- O filtro do menu é só visual; o controle de acesso real fica nos guards de [`../../security/EGM.md`](../../security/EGM.md).
- Ao sair do gerenciamento de outra empresa, `ReportStateService`, `DacReportStateService` e `MyCallsStateService` são resetados antes de navegar para `/`, para não exibir dados da empresa anterior.
- A preferência de dark mode é lida de `UserService.getUserSettings()` no `ngOnInit` da topbar.

## Side Effects
- HTTP via `UserService`: `POST /users/manage/exit` (topbar), `PUT /users/webphone` (diálogo de ramal).
- `logout()` remove `localStorage['token']` e redireciona para `/`.
- `openWhatsApp()` abre `https://wa.me/551154201020` em nova aba.
- Manipula classes de `document.body` (`blocked-scroll`) e lê o DOM para detectar clique externo.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
