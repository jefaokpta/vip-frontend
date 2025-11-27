# frontend

Frontend Angular responsável por integrar com o iasmin-backend para:
- Visualizar relatórios de ligações e análises feitas por IA;
- Gestão de usuários e empresas;
- Operar o WebPhone (telefone via web) para fazer e receber ligações via SIP.

Este README foi escrito para facilitar a manutenção por humanos e por agentes de IA: descreve a arquitetura, tecnologias, padrões de código, configuração de ambientes, comandos e pontos de extensão.

## Tecnologias e Frameworks
- Angular 19 (Framework): https://angular.dev/api
- PrimeNG (biblioteca de componentes): https://primeng.org/installation
- @primeng/themes (temas PrimeNG)
- PrimeIcons
- Tailwind CSS (utilitários de estilo)
- JsSIP (biblioteca SIP): https://jssip.net/documentation/api
- ngx-socket-io (Socket.IO para Angular): https://socket.io/docs/v4/
- Chart.js (gráficos)
- Quill (editor rich text)

## Arquitetura e Estrutura
- Angular com build via @angular-devkit/build-angular; saída em `dist/iasmin-frontend`.
- Estilos globais em `src/styles.scss`, importando Tailwind (`src/tailwind.css`), layout (`src/assets/layout/layout.scss`) e PrimeIcons.
- Ambientes em `src/environments/environment.ts` (dev) e `src/environments/environment.prod.ts` (prod), incluindo:
  - `IASMIN_BACKEND_URL`: URL base do backend (HTTP/HTTPS);
  - `IASMIN_PABX_URL`: host do PABX para o WebSocket SIP (WSS).
- WebPhone (JsSIP) em `src/app/webphone/webphone.service.ts`:
  - Conecta via `wss://{IASMIN_PABX_URL}:8089/ws` usando JsSIP `UA` e `WebSocketInterface`;
  - Integração com `UserService` para identificar o usuário e `DashboardService` para obter token da chamada;
  - Controle de estado com Angular Signals (PhoneState/PhoneStateEnum) e timers;
  - Manipuladores de eventos para conectado/registrado/chamada em progresso/falhas.
- Serviços utilitários em `src/app/services` (UserService, DashboardService, etc.).

Estrutura de pastas (parcial):
- `src/app/webphone/webphone.service.ts` — lógica do telefone via web (SIP/RTC);
- `src/app/services` — serviços de domínio/utilitários;
- `src/app/types/types.ts` — tipagens compartilhadas (inclui tipos para RTCSession, etc.);
- `src/environments` — variáveis por ambiente;
- `src/assets` — estilos/layout/estáticos.

## Requisitos
- Node.js 20 LTS (recomendado) e npm 10+;
- Angular CLI global opcionalmente (`npm i -g @angular/cli`), mas os scripts NPM já cobrem o fluxo.

## Configuração de Ambiente
Ajuste as URLs conforme seu cenário:
- Desenvolvimento (`src/environments/environment.ts`):
  - `IASMIN_BACKEND_URL: 'http://localhost:3000'`
  - `IASMIN_PABX_URL: 'iasmin-pabx.vipsolutions.com.br'` (exemplo)
- Produção (`src/environments/environment.prod.ts`): valores voltados para nuvem.

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
- Chamada: `makeCall(telephone)` obtém um token via `DashboardService.getCallToken()` e inicia a chamada com `extraHeaders` (e.g. `X-CALL-TOKEN`).
- Recepção: sessões de entrada são tratadas em `incommingSession` com anexação de `MediaStream` a um elemento `Audio`.
- Controles: `answerCall`, `hangup`, `sendDTMF`, `toggleMute`, controle de tempo de chamada.

Dicas de Debug:
- Ativar logs detalhados do JsSIP no navegador: no console, execute `localStorage.debug = 'JsSIP:*'` e recarregue a página.
- Verifique permissões de microfone, políticas de autoplay (para áudio), e a conectividade WSS (porta 8089, TLS).
- Use DevTools para inspecionar `RTCPeerConnection`, `MediaStream` e eventos do `UA`.

## Socket.IO (ngx-socket-io)
A biblioteca `ngx-socket-io` está instalada para recursos em tempo real (notificações, eventos de ligação, presença, etc.). Caso precise habilitar/configurar:

Exemplo de configuração (Angular standalone/module):
```ts
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
const config: SocketIoConfig = { url: environment.IASMIN_BACKEND_URL, options: { transports: ['websocket'] } };
// No app config/module:
// imports: [SocketIoModule.forRoot(config)]
```
Ajuste a `url` para o endpoint do Socket.IO no backend. Exponha valores via `environment` conforme necessário.

## Integração com o Backend
- Base URL: `environment.IASMIN_BACKEND_URL`.
- Autenticação: o projeto possui `jwt-decode` (tokens JWT). Garanta o fluxo de login, armazenamento e renovação de tokens conforme as políticas de segurança.
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
  - Serviços: `src/app/services/`.
- Tarefas típicas:
  - Criar componentes/páginas com Angular + PrimeNG.
  - Ajustar integrações HTTP usando `IASMIN_BACKEND_URL`.
  - Evoluir o WebPhone (ex.: hold/transfer, reconexão, métricas) mantendo imutabilidade e DRY.
  - Adicionar recursos em tempo real via `ngx-socket-io`.
- Debug/checklist:
  - Console do navegador sem erros, logs JsSIP habilitados quando necessário.
  - Permissões de mídia OK, certificado TLS válido para WSS.
  - Backend acessível via `IASMIN_BACKEND_URL`.

## Links úteis
- Angular: https://angular.dev/api
- PrimeNG: https://primeng.org/installation
- JsSIP: https://jssip.net/documentation/api
- Socket.IO: https://socket.io/docs/v4/
- DRY: https://en.wikipedia.org/wiki/Don%27t_repeat_yourself
- Immutability: https://en.wikipedia.org/wiki/Immutable_object
