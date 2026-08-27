# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Angular frontend that integrates with the **vip-pabx-manager** backend to provide: real-time peer/queue dashboards, full PABX administration (peers, trunks, routes, dialplan, queues, IVR/URA, call groups, MOH, calendars, DDR), company/user management, and a browser-based SIP WebPhone.

## Commands

- Install: `npm ci`
- Dev server: `npm start` (ng serve, http://localhost:4200)
- Build: `npm run build` (output: `dist/iasmin-frontend`)
- Build with watch: `npm run watch`
- Tests (Karma/Jasmine): `npm test`
- Run a single test file: not wired via npm script — use `ng test --include='**/path/to/some.spec.ts'`
- Format (Prettier): `npm run format`
- Lint: no npm script defined; ESLint config exists (`eslint.config.js`) but must be invoked directly via `npx eslint` if needed

There is no CI-integrated lint script — `npm run format` (Prettier) is the enforced formatting step before a PR.

## Architecture

Angular 19, **Standalone Components only** (no NgModules), lazy-loaded route trees, Angular **Signals** for reactive state.

### Bootstrap & routing entry points

Top-level app files live directly in `src/`, not `src/app/`:

- `src/main.ts` — bootstraps `AppComponent` with `appConfig`
- `src/app.config.ts` — `ApplicationConfig`: router, `provideHttpClient(withFetch())`, PrimeNG theme (Aura preset) + pt-BR locale
- `src/app.routes.ts` — root routes: `AppLayout` (guarded by `authGuard`) wraps `pages/*` and `pabx/*` lazy children; `auth/*` is a separate unguarded lazy tree

All feature modules live under `src/app/` and are imported via the `@/*` path alias, which maps to `src/app/*` (see `tsconfig.json`). Always use `@/...` imports for anything under `src/app`, not relative paths across module boundaries.

### Feature module layout (`src/app/`)

Each domain folder under `pabx/` and `pages/` is self-contained: components/pages, its own `*.service.ts` (colocated, not in a shared `services/` directory), and a `*.routes.ts` where applicable. Route files are consumed via `loadChildren: () => import('@/xxx/xxx.routes')` — the default export is the `Routes` array.

- `auth/` — login, registro, esqueci senha, bloqueio de tela, `auth.routes.ts`
- `layout/` — shell layout, sidebar, topbar, menu, configurador, `activate-peer-dialog/`
- `pabx/` — largest module, one subfolder per PABX entity (`peer/`, `trunk/`, `route/`, `queue/`, `dialplan/`, `accountcode/`, `alias/`, `calendar/`, `call-group/`, `ddr/`, `moh/`, `pickup-group/`, `ura/`, `report/`, `settings/`); `dialplan/components/` holds one component per dialplan action type (accountcode, alias, answer, hangup, peer, route, trunk, variable, calendar, playback, call-group, ura, queue, etc.)
- `pages/` — `dashboard/` (peer.dashboard, queue.dashboard, real-time components), `company/`, `users/`, `queues/` (queue-login), `person/`
- `webphone/` — `webphone.service.ts` (JsSIP UA + Signals), sidebar/topbar UI
- `websocket/stomp/` — `@stomp/rx-stomp` client for real-time backend notifications
- `security/auth-guard.ts` — `CanActivateFn` that calls `UserService.refreshToken()`, redirects to `/auth/login` (preserving `returnUrl`) on failure, or to `/auth/newpassword` if the user hasn't set a password yet
- `types/` — shared TS interfaces/enums, one file per type (not a single `types.ts`)
- `util/` — cross-cutting utilities (e.g. `title.service.ts`)

Note: the README's directory tree uses plural folder names (`peers/`, `trunks/`, `queues/`) — actual folders are singular (`peer/`, `trunk/`, `queue/`); verify with `find src/app -maxdepth 2 -type d` rather than trusting the README listing.

### State pattern: Angular Signals

Services holding live/reactive state (WebPhone, dashboards) use `signal()` and update via spread to stay immutable: `state.update(s => ({ ...s, ...patch }))`. Follow this pattern for new reactive services rather than mutating signal state in place.

### WebPhone (`src/app/webphone/webphone.service.ts`)

- JsSIP `UA` connected via `WebSocketInterface` to `wss://{PABX_URL}:8089/ws`; `UA.start()` runs in the service constructor.
- SIP identity: `sip:{user.id}@{PABX_URL}`, password `IASMIN_WEBPHONE_{user.id}`.
- State: `PhoneState`/`PhoneStateEnum` signal, updated immutably.
- Events handled: `connected`, `disconnected`, `registered`, `registrationFailed`, `newRTCSession`.
- `makeCall(telephone)` first fetches a call token via `PeerDashboardService.getCallToken()`, then sends it as the `X-CALL-TOKEN` extra SIP header.
- Inbound calls are handled in `incommingSession`, attaching the remote `MediaStream` to an `Audio` element.
- Debug: `localStorage.debug = 'JsSIP:*'` in the browser console + reload for verbose JsSIP logs. Requires WSS/TLS on port 8089 and microphone permission.

### Real-time updates (`src/app/websocket/stomp/`)

`@stomp/rx-stomp` (STOMP over WebSocket) connects to `environment.WEBSOCKET_BACKEND_URL`. Config in `rx-stomp-config.ts`, factory in `rx-stomp-service-factory.ts`, wrapped by `websocket.service.ts`. Drives live updates in the peer/queue dashboards (peer state, queue state, call events like `CALL_ANSWERED`/`CALL_ABANDON`).

### Environments (`src/environments/`)

- `environment.ts` (dev): `API_BACKEND_URL: 'http://localhost:8080'`, `WEBSOCKET_BACKEND_URL: 'ws://localhost:8080/ws'`, `PABX_URL: 'vip-register.vipsolutions.com.br'`
- `environment.prod.ts`: production URLs for vip-pabx-manager

Auth is JWT-based (`jwt-decode`); `UserService.refreshToken()` backs the route guard.

## Conventions

- Component selector prefix: `p` (element, kebab-case for components; attribute, camelCase for directives) — enforced by `@angular-eslint/component-selector` / `directive-selector`.
- Prettier: 4-space indent, single quotes, semicolons, no trailing commas, printWidth 120. Angular parser used for `*.component.html`.
- PrimeNG 19 (Aura theme, pt-BR locale) + Tailwind CSS 3 utilities for styling.

## Definição de Trabalho Feito (Definition of Done)

* **Verificação técnica (`verification-before-completion` & `test-driven-development`)**: Uma alteração só é considerada feita quando todos os testes passam com sucesso. Utilize `test-driven-development` durante a implementação e acione a skill `verification-before-completion` antes de comitar ou declarar conclusão, garantindo a exibição das evidências de execução dos testes. Nunca pule, desabilite ou enfraqueça testes; em caso de falhas imprevistas, aplique a skill `systematic-debugging`.
* **Revisão automatizada (`requesting-code-review`)**: Nenhuma branch deve ser fundida (merge) na branch `dev` sem passar por uma revisão de código automatizada. Invoque a skill `requesting-code-review` para solicitar a validação por um agente independente (diferente daquele que escreveu o código), utilizando um modelo mais capaz (ex: Opus 5).
* **Processo de revisão (`receiving-code-review`)**: Ao receber o feedback da revisão, utilize a skill `receiving-code-review` para analisar o retorno e implementar as correções com rigor técnico (evitando concordância performática). Se a verificação falhar, o agente deve corrigir a falha e repetir o ciclo (testes → revisão) até passar (limite máximo de 5 rounds). A revisão deve ser comitada com uma mensagem clara.
* **Convenções e Planos (`executing-plans` & `writing-plans`)**: A execução do trabalho deve respeitar os planos estabelecidos. Não edite `to-do.md` (ou qualquer outro arquivo de plano criado pelo usuário ou por outro agente) diretamente no worktree fora do fluxo formal gerenciado por `executing-plans`.
* **Subagentes (`subagent-driven-development` & `using-git-worktrees`)**: Tarefas delegadas a subagentes (utilizando modelos mais simples como Haiku) devem ser executadas via `subagent-driven-development` (ou `dispatching-parallel-agents` para múltiplos fluxos independentes) e trabalhar estritamente em worktrees isoladas criadas via `using-git-worktrees`, para não interferir no desenvolvimento em andamento.
* **Merge final (`finishing-a-development-branch`)**: Com o trabalho feito (testes validados com evidências e revisão aprovada), execute a skill `finishing-a-development-branch` para conduzir a integração na branch `dev` e realizar a limpeza correta do ambiente e das worktrees.
