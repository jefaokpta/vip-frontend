# frontend Blueprint

## System Overview
SPA Angular 19 (standalone components, Signals, PrimeNG 19 + Tailwind) que é a interface do backend **vip-pabx-manager**. Oferece:

- painéis em tempo real de ramais, filas e workers (STOMP sobre WebSocket);
- administração completa do PABX (ramais, troncos, rotas, dialplan, filas, URA, grupos, áudios, calendários, DDR, pausas, pesquisas);
- relatórios de chamadas, DAC, URA, pesquisas e atividade de membros, com transcrições de IA;
- gestão de empresas, tenants, usuários e IPs bloqueados;
- um webphone SIP no navegador (JsSIP sobre WSS).

Fluxo: `src/main.ts` faz o bootstrap com `appConfig`. As rotas raiz (`src/app.routes.ts`) colocam a área autenticada sob `AppLayout` + `authGuard` e carregam `pages/*` e `pabx/*` sob demanda; `auth/*` é público. Os serviços chamam o backend REST com `executeRequest(...)` + `httpHeaders()` (Bearer JWT de `localStorage['token']`). Os painéis assinam tópicos STOMP. O webphone registra o ramal do usuário em `wss://<PABX_URL>:8089/ws`.

## Local Interface & Invariants
- `package.json`: scripts `start` (`ng serve`), `build` (`ng build`), `watch`, `format` (Prettier) e `test` (`ng test`, Karma/Jasmine).
- `angular.json`: builder `application` com `outputPath: dist/frontend`; o build de produção troca `environment.ts` por `environment.prod.ts`; testes pelo builder `karma`.
- `tsconfig.json`: alias `@/*` → `src/app/*` (use `@/...` para importar qualquer coisa sob `src/app`).
- `vercel.json`: reescreve todas as rotas para `/index.html` (roteamento SPA).
- `deploy-frontend.sh`: `npm run build` e `aws s3 sync ./dist/vip2-frontend/browser s3://vip2-frontend --delete`. O caminho de origem difere do `outputPath` de `angular.json` (`dist/frontend`); confira antes de usar.
- `eslint.config.js`, `tailwind.config.js`, `.prettierrc.json`: configuração de lint, estilo e formatação (sem script npm de lint).
- `README.md` e `CLAUDE.md` são mantidos por humanos e não são gerados por este índice; alguns trechos deles divergem do código atual (por exemplo, nomes de pastas e a identidade SIP do webphone). Os contratos `EGM.md` foram extraídos do código.

## Subdirectories & System Boundaries
- src: [./src/EGM.md](./src/EGM.md) - bootstrap, `appConfig`, rotas raiz e ambientes.
  - src/app: [./src/app/EGM.md](./src/app/EGM.md) - índice dos módulos de funcionalidade.
    - auth: [./src/app/auth/EGM.md](./src/app/auth/EGM.md) - login, recuperar senha, confirmação por código e nova senha.
    - layout: [./src/app/layout/EGM.md](./src/app/layout/EGM.md) - casca, menu filtrado por role/módulo e `LayoutService`.
    - pabx: [./src/app/pabx/EGM.md](./src/app/pabx/EGM.md) - entidades e relatórios do PABX (23 subdiretórios).
    - pages: [./src/app/pages/EGM.md](./src/app/pages/EGM.md) - painéis, empresas, tenants, usuários (`UserService`), IPs bloqueados e perfil.
    - security: [./src/app/security/EGM.md](./src/app/security/EGM.md) - guards de autenticação, módulo, role e hierarquia.
    - types: [./src/app/types/EGM.md](./src/app/types/EGM.md) - tipos compartilhados.
    - util: [./src/app/util/EGM.md](./src/app/util/EGM.md) - wrapper HTTP, cabeçalho de auth, helpers.
    - webphone: [./src/app/webphone/EGM.md](./src/app/webphone/EGM.md) - telefone SIP JsSIP.
    - websocket: [./src/app/websocket/stomp/EGM.md](./src/app/websocket/stomp/EGM.md) - cliente STOMP.
  - src/environments: [./src/environments/EGM.md](./src/environments/EGM.md) - URLs por ambiente.

## Global Invariants
- Identidade: o usuário é sempre derivado do JWT em `localStorage['token']` (`UserService`); qualquer resposta que traga token novo (login, refresh, gerenciar/sair de empresa, perfil) substitui o token e atualiza o signal do usuário.
- Acesso: `authGuard` em toda a área autenticada, `moduleGuard(ModuleEnum.PABX)` em `/pabx` e no painel de ramais/filas, `roleGuard` no painel de filas, `manageUserGuard` na edição de usuário. O menu filtra por `roles`/`module`, mas isso é só visual.
- Hierarquia de roles = ordem de declaração de `RoleEnum`; não reordene.
- Trocar de empresa gerenciada exige resetar `ReportStateService`, `DacReportStateService` e `MyCallsStateService` (feito em `CompanyPage.manageCompany` e `AppTopbar.exitManagingCompany`).
- HTTP: sem interceptors; todo serviço usa `executeRequest` (timeout padrão 5 s, 10 s em relatórios, 60 s para criar/excluir empresa) com `httpHeaders()`.
- Estado reativo com Signals atualizados de forma imutável (`update(s => ({ ...s, ...patch }))`).
- Troncos são compartilhados entre empresas (`Trunk.companyId` só registra a empresa que criou); a prioridade da regra de dialplan só desempata regras com o mesmo destino.

## Global Side Effects
- REST: `environment.API_BACKEND_URL` (vip-pabx-manager) e `environment.IA_BACKEND_URL` (transcrições).
- STOMP/WebSocket: `environment.WEBSOCKET_BACKEND_URL`, tópicos `/topic/peerregistries/{companyId}`, `/topic/peerregistries-removed/{companyId}`, `/topic/queuestates/{companyId}`, `/topic/queues-removed/{companyId}`.
- SIP/WebRTC: `wss://<PABX_URL>:8089/ws`, microfone e reprodução de áudio.
- Upload de áudio direto para a URL pré-assinada devolvida por `POST /mohs`.
- `localStorage`: `token`, `settings`, `webphoneCallHistory`, `peer-dashboard-view-mode`.
- Downloads gerados no navegador (CSV de credenciais de ramais).

## System Verification
- Run: `npm test` (na raiz de `frontend/`)
