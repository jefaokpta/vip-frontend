# frontend

Frontend Angular responsável por integrar com o vip-pabx-manager para:
- Visualizar relatórios de ligações e análises feitas por IA;
- Dashboards em tempo real de peers e filas de atendimento;
- Administração PABX completa: ramais, troncos, rotas, dialplan, filas, URA/IVR, grupos de chamada, MOH, calendários, DDR;
- Gestão de usuários e empresas;
- Operar o WebPhone (telefone via web) para fazer e receber ligações via SIP.

Este README foi escrito para facilitar a manutenção por humanos e por agentes de IA: descreve a arquitetura, tecnologias, padrões de código, configuração de ambientes, comandos e pontos de extensão.

## Tecnologias e Frameworks

- Angular 19 (Standalone Components, Signals): https://angular.dev/api
- PrimeNG 19 (biblioteca de componentes): https://primeng.org/installation
- @primeng/themes (temas PrimeNG)
- PrimeIcons
- Tailwind CSS 3 (utilitários de estilo)
- JsSIP 3.10 (biblioteca SIP/WebPhone): https://jssip.net/documentation/api
- @stomp/rx-stomp (WebSocket STOMP para notificações em tempo real)
- Chart.js 4 (gráficos)
- Quill (editor rich text)
- jwt-decode (decodificação de tokens JWT)

## Arquitetura e Estrutura

Angular 19 com Standalone Components (sem NgModules), lazy loading por módulo de rota e Angular Signals para estado reativo.
Build via `@angular-devkit/build-angular`; saída em `dist/iasmin-frontend`.

### Ambientes (`src/environments/`)

- `environment.ts` (dev): `API_BACKEND_URL: 'http://localhost:8080'`, `WEBSOCKET_BACKEND_URL: 'ws://localhost:8080/ws'`, `PABX_URL: '...'`
- `environment.prod.ts` (prod): URLs de produção para o vip-pabx-manager.

### Estrutura de módulos (`src/app/`)

```
src/app/
├── auth/                     # Login, registro, esqueci senha, bloqueio de tela
├── layout/                   # Layout principal, sidebar, topbar, menu, configurador
│   └── activate-peer-dialog  # Dialog de ativação de ramal
├── pabx/                     # Administração PABX (módulo maior)
│   ├── peers/                # Ramais/endpoints SIP
│   ├── trunks/               # Troncos
│   ├── routes/               # Rotas de saída
│   ├── queues/               # Filas de atendimento (+ queue-detail)
│   ├── dialplan/             # Editor de dialplan com builder de ações
│   │   └── components/       # 18+ tipos de ação (accountcode, alias, answer,
│   │                         #   hangup, peer, route, trunk, variable, calendar,
│   │                         #   playback, call-group, ura, queue, etc.)
│   ├── account-codes/        # Códigos de conta
│   ├── aliases/              # Aliases SIP
│   ├── calendars/            # Calendários comerciais
│   ├── call-groups/          # Grupos de chamada
│   ├── ddr/                  # Regras de discagem direta
│   ├── moh/                  # Música em espera
│   ├── pickup-groups/        # Grupos de captura
│   ├── uras/                 # Sistema IVR/URA
│   ├── reports/              # Relatórios de chamadas
│   └── settings/             # Configurações da empresa
├── pages/                    # Páginas gerais
│   ├── dashboard/            # Dashboards em tempo real
│   │   ├── peer.dashboard    # Dashboard de peers/agentes
│   │   ├── queue.dashboard   # Dashboard de filas
│   │   └── components/       # call-overview, stats-cards, last-analysis, temperature
│   ├── company/              # Gestão de empresas
│   ├── users/                # Gestão de usuários
│   ├── queue-login/          # Login de agente em fila
│   └── person/               # Perfil do usuário
├── webphone/                 # WebPhone SIP (JsSIP)
│   ├── webphone.service.ts   # UA JsSIP com Angular Signals
│   ├── webphone-sidebar      # UI do telefone na sidebar
│   └── webphone-topbar       # UI do telefone na topbar
├── websocket/stomp/          # WebSocket STOMP (RxStomp) para notificações em tempo real
├── services/                 # Serviços utilitários e de domínio
├── security/                 # Auth guard para rotas protegidas
└── types/types.ts            # Interfaces TypeScript compartilhadas
```

### WebPhone (`src/app/webphone/webphone.service.ts`)

- Conecta via `wss://{PABX_URL}:8089/ws` usando JsSIP `UA` e `WebSocketInterface`.
- Estado gerenciado com Angular Signals (`PhoneState`/`PhoneStateEnum`) — imutável via spread.
- Eventos: `connected`, `disconnected`, `registered`, `registrationFailed`, `newRTCSession`.
- Controles: `makeCall`, `answerCall`, `hangup`, `sendDTMF`, `toggleMute`, timer de chamada.

### WebSocket em tempo real (`src/app/websocket/stomp/`)

- Utiliza `@stomp/rx-stomp` (protocolo STOMP sobre WebSocket).
- Configurado em `rx-stomp-config.ts`; fábrica em `rx-stomp-service-factory.ts`.
- Recebe notificações de estado de peers, filas e eventos de chamada do vip-pabx-manager.

## Requisitos
- Node.js 20 LTS (recomendado) e npm 10+;
- Angular CLI global opcionalmente (`npm i -g @angular/cli`), mas os scripts NPM já cobrem o fluxo.

## Configuração de Ambiente
Ajuste as URLs conforme seu cenário:
- Desenvolvimento (`src/environments/environment.ts`):
    - `API_BACKEND_URL: 'http://localhost:8080'`
    - `WEBSOCKET_BACKEND_URL: 'ws://localhost:8080/ws'`
    - `PABX_URL: 'vip-register.vipsolutions.com.br'` (exemplo)
- Produção (`src/environments/environment.prod.ts`): URLs de produção para o vip-pabx-manager.

Observações:
- O WebPhone exige WSS (TLS). Garanta certificados válidos no domínio do PABX e acesso à porta 8089.
- Conceda permissão de microfone no navegador para chamadas.

## Instalação
```bash
npm ci
```

## Scripts
- Desenvolvimento: `npm run start:frontend` (ng serve em modo dev)
- Build: `npm run build`
- Build com watch: `npm run watch`
- Testes unitários: `npm test`
- Formatação: `npm run format` (Prettier)

Após iniciar em desenvolvimento, acesse http://localhost:4200/.

## Testes
Executar Karma/Jasmine:
```bash
npm test
```

## Boas Práticas e Padrões
- DRY (Don't Repeat Yourself): https://en.wikipedia.org/wiki/Don%27t_repeat_yourself
- Imutabilidade: https://en.wikipedia.org/wiki/Immutable_object
- Angular Signals/Observables: prefira estados imutáveis e side effects controlados. Ex.: o `WebphoneService` usa `signal` e `update` com spread (`{ ...state, ...newState }`).
- Formatação automática com Prettier: `npm run format`.
- ESLint está disponível nas devDependencies. Caso precise, adicione/configure o arquivo de regras para o time/projeto.

## Guia do WebPhone (JsSIP)
- Configuração: o serviço `WebphoneService` cria um `UA` com `uri` no formato `sip:{user.id}@{IASMIN_PABX_URL}` e autentica com senha baseada no usuário (`IASMIN_WEBPHONE_{user.id}`). O WebSocket é `wss://{IASMIN_PABX_URL}:8089/ws`.
- Início: o `UA.start()` é chamado no construtor do serviço. Eventos tratados: `connected`, `disconnected`, `registered`, `registrationFailed`, `newRTCSession`.
- Chamada: `makeCall(telephone)` obtém um token via `PeerDashboardService.getCallToken()` e inicia a chamada com `extraHeaders` (e.g. `X-CALL-TOKEN`).
- Recepção: sessões de entrada são tratadas em `incommingSession` com anexação de `MediaStream` a um elemento `Audio`.
- Controles: `answerCall`, `hangup`, `sendDTMF`, `toggleMute`, controle de tempo de chamada.

Dicas de Debug:
- Ativar logs detalhados do JsSIP no navegador: no console, execute `localStorage.debug = 'JsSIP:*'` e recarregue a página.
- Verifique permissões de microfone, políticas de autoplay (para áudio), e a conectividade WSS (porta 8089, TLS).
- Use DevTools para inspecionar `RTCPeerConnection`, `MediaStream` e eventos do `UA`.

## WebSocket em Tempo Real (@stomp/rx-stomp)

O módulo `src/app/websocket/stomp/` usa `@stomp/rx-stomp` (STOMP sobre WebSocket) para receber notificações em tempo real do backend.

- URL configurada via `WEBSOCKET_BACKEND_URL` no environment.
- Serviço principal: `websocket.service.ts` (wrapper do `RxStompService`).
- Usado nos dashboards de peers e filas para atualização em tempo real de estados e eventos de chamada.

## Integração com o Backend

- Base URL: `environment.API_BACKEND_URL` (aponta para o vip-pabx-manager na porta 8080).
- Autenticação: tokens JWT via `jwt-decode`. Garanta o fluxo de login, armazenamento e renovação conforme as políticas de segurança.
- CORS/CSRF: configure o backend para aceitar as origens corretas em desenvolvimento e produção.

## Fluxo de Contribuição
1. Crie uma branch a partir de `main` (ex.: `feat/xxx`, `fix/yyy`).
2. Rode `npm ci`, `npm run start:frontend`, `npm test` e `npm run format` antes de abrir PR.
3. Descreva claramente mudanças, passos de teste e impacto no WebPhone/tempo real.

## Como um Agente de IA pode ajudar
- Leitura rápida:
  - Scripts: `package.json`.
  - Ambientes: `src/environments/`.
  - WebPhone: `src/app/webphone/webphone.service.ts`.
  - Dashboards: `src/app/pages/dashboard/`.
  - PABX: `src/app/pabx/` (módulo maior, com sub-módulos por feature).
  - Tipos compartilhados: `src/app/types/types.ts`.
- Tarefas típicas:
    - Criar componentes/páginas com Angular 19 Standalone + PrimeNG 19.
    - Ajustar integrações HTTP usando `API_BACKEND_URL`.
    - Evoluir o WebPhone (hold/transfer, reconexão, métricas) mantendo imutabilidade com Signals.
    - Adicionar recursos em tempo real via `@stomp/rx-stomp` (`websocket/stomp/`).
- Debug/checklist:
  - Console do navegador sem erros, logs JsSIP habilitados quando necessário.
  - Permissões de mídia OK, certificado TLS válido para WSS (porta 8089).
  - Backend acessível via `API_BACKEND_URL` e WebSocket via `WEBSOCKET_BACKEND_URL`.

## Links úteis
- Angular: https://angular.dev/api
- PrimeNG: https://primeng.org/installation
- JsSIP: https://jssip.net/documentation/api
- Socket.IO: https://socket.io/docs/v4/
- DRY: https://en.wikipedia.org/wiki/Don%27t_repeat_yourself
- Immutability: https://en.wikipedia.org/wiki/Immutable_object
