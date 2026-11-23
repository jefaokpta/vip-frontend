# src/app

## Overview
Raiz dos módulos de funcionalidade, importados pelo alias `@/*` (`tsconfig.json` mapeia `@/*` para `src/app/*`). Não tem arquivos de código diretos: os pontos de entrada e rotas raiz ficam em `src/`.

## Subdirectories & Boundaries
- auth: [./auth/EGM.md](./auth/EGM.md) - telas públicas em `/auth` (login, recuperar senha, confirmar e-mail, nova senha).
- layout: [./layout/EGM.md](./layout/EGM.md) - casca da área autenticada (`AppLayout`, menu filtrado por role/módulo, topbar) e `LayoutService`.
- pabx: [./pabx/EGM.md](./pabx/EGM.md) - administração e relatórios do PABX em `/pabx`, exige o módulo `PABX`.
- pages: [./pages/EGM.md](./pages/EGM.md) - páginas gerais em `/pages`, painéis em tempo real, empresas, tenants, usuários e o `UserService` central.
- security: [./security/EGM.md](./security/EGM.md) - guards `authGuard`, `moduleGuard`, `roleGuard`, `manageUserGuard`.
- types: [./types/EGM.md](./types/EGM.md) - tipos de domínio compartilhados (`User`, `RoleEnum`, `ModuleEnum`, `Company`...).
- util: [./util/EGM.md](./util/EGM.md) - `executeRequest`, `httpHeaders`, `transferPickListItems`, `TitleService`.
- webphone: [./webphone/EGM.md](./webphone/EGM.md) - telefone SIP via JsSIP, tons locais e histórico em `localStorage`.
- websocket: [./websocket/stomp/EGM.md](./websocket/stomp/EGM.md) - cliente STOMP (`WebsocketService`, `rxStompServiceFactory`).
