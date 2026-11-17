# websocket/stomp

## Overview
Cliente STOMP sobre WebSocket (via `@stomp/rx-stomp`) usado pelos painéis em tempo real (ramais, filas, login em filas e detalhe de fila) para receber eventos do backend.

## Interface
- `WebsocketService` (`websocket.service.ts`): subclasse injetável de `RxStomp` (`providedIn: 'root'`), sem lógica própria.
- `myRxStompConfig: RxStompConfig` (`rx-stomp-config.ts`): `brokerURL = environment.WEBSOCKET_BACKEND_URL`, `heartbeatIncoming`/`heartbeatOutgoing = 50000`, `reconnectDelay = 5000`, `debug` loga no console.
- `rxStompServiceFactory()` (`rx-stomp-service-factory.ts`): cria um `WebsocketService`, aplica `myRxStompConfig` e chama `activate()`.

## Invariants
- `beforeConnect` relê `localStorage.getItem('token')` a cada tentativa de conexão e envia `Authorization: Bearer <token>` no CONNECT; reconexões usam sempre o token atual (renovado ou de gerenciamento de empresa).
- O heartbeat de 50s deve ficar abaixo do timeout de 2 min da plataforma de hospedagem (comentário em `rx-stomp-config.ts`).
- Consumidores registram o serviço por componente com `providers: [{ provide: WebsocketService, useFactory: rxStompServiceFactory }]` (em `peer.dashboard.ts`, `queue.dashboard.ts`, `queue-login.ts`, `queue-detail.page.ts`); cada instância abre a própria conexão.

## Side Effects
- Abre conexão WebSocket com `environment.WEBSOCKET_BACKEND_URL` ao ser criado pela factory.
- Lê `localStorage['token']`.
- Loga cada mensagem de diagnóstico STOMP no console (`debug`).
- Os consumidores só cancelam as assinaturas em `ngOnDestroy`; nenhum chama `deactivate()`.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
