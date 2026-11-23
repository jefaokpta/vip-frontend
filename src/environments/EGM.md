# environments

## Overview
Constantes de endpoint por ambiente, importadas por serviços como `environment` (`../../environments/environment` ou caminhos relativos equivalentes).

## Interface
- `environment` (`environment.ts`, desenvolvimento) e `environment` (`environment.prod.ts`, produção), ambos com: `production`, `API_BACKEND_URL` (REST), `WEBSOCKET_BACKEND_URL` (STOMP), `PABX_URL` (host SIP/WSS do webphone), `IA_BACKEND_URL` (serviço de transcrições).

## Invariants
- Os dois arquivos devem expor as mesmas chaves: o build de produção troca `environment.ts` por `environment.prod.ts` via `fileReplacements` em `angular.json`.
- `environment.ts` atual aponta `API_BACKEND_URL`/`WEBSOCKET_BACKEND_URL` para o vip-pabx-manager remoto (as URLs `localhost:8080` estão comentadas) e `IA_BACKEND_URL` para `http://localhost:8083`.
- `PABX_URL` é só o host: o webphone monta `wss://<PABX_URL>:8089/ws` e `sip:...@<PABX_URL>`.

## Side Effects
- None

## Verification
- Run: `npm test` (na raiz de `frontend/`)
