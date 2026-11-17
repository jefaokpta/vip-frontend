# src

## Overview
Pontos de entrada da aplicação Angular 19 (standalone, sem NgModules): bootstrap, configuração de providers e tabela de rotas raiz. Os módulos de funcionalidade ficam em `app/` e as constantes de ambiente em `environments/`.

## Interface
- `main.ts`: `bootstrapApplication(AppComponent, appConfig)`.
- `AppComponent` (`app-root`, `app.component.ts`): só `<router-outlet>`; chama `TitleService.initializeTitleListener()` no `ngOnInit`.
- `appConfig: ApplicationConfig` (`app.config.ts`): `provideRouter(appRoutes, withInMemoryScrolling(...), withEnabledBlockingInitialNavigation())`, `provideHttpClient(withFetch())`, `provideAnimationsAsync()`, `providePrimeNG` (preset `Aura`, `darkModeSelector: '.app-dark'`, tradução `pt-BR` de `primelocale`).
- `appRoutes: Routes` (`app.routes.ts`):
  - `''` → `AppLayout` com `canActivate: [authGuard]` e filhos: `''` → `MyCallsDashboard` (lazy), `calls/:id` → `ReportDetailPage` (lazy), `pages` → `@/pages/pages.routes`, `pabx/call-report/detail/:id` → redireciona para `/calls/:id`, `pabx` → `@/pabx/pabx.routes` com `moduleGuard(ModuleEnum.PABX)`.
  - `notfound` → `Notfound`; `auth` → `@/auth/auth.routes` (sem guard); `**` → `/notfound`.
- Subdiretórios:
  - [app](./app/EGM.md) - módulos de funcionalidade.
  - [environments](./environments/EGM.md) - URLs de backend, WebSocket, PABX e IA.

## Invariants
- Toda a área autenticada passa por `authGuard`, que revalida o token no backend a cada ativação; `auth/*` e `notfound` ficam fora.
- O módulo PABX inteiro exige `ModuleEnum.PABX` no JWT do usuário.
- O título da aba vem de `data.breadcrumb` das rotas (via `TitleService`).
- Não há interceptors HTTP: a autenticação é aplicada por chamada com `httpHeaders()`.

## Side Effects
- Bootstrap do app no `index.html` e registro do listener de navegação para o título.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
