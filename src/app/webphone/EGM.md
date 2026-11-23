# webphone

## Overview
Telefone SIP no navegador baseado em JsSIP: registro do ramal via WSS, chamadas de saída e entrada, DTMF, transferência e estacionamento por códigos de facilidade, tons gerados localmente e histórico de chamadas no navegador. Expõe a UI na topbar e numa sidebar.

## Interface
- `WebphoneService` (`webphone.service.ts`, `providedIn: 'root'`):
  - Estado: `phoneState$` (signal readonly de `PhoneState`), `dialedDigits`, `transferMode: signal<TransferMode | null>`, `dialpadVisible`.
  - Métodos: `startJsSipIfEligible()`, `makeCall(telephone)`, `sendDTMF(digit)`, `playKeyTone(digit)`, `startTransfer(mode: TransferMode)`, `park()`, `toggleDialpad()`, `hangup()`, `answerCall()`, `toggleMute()`, `callTimeFormated()`.
  - `TransferMode = 'blind' | 'attended'`.
- `CallHistoryService` (`call-history.service.ts`): `history` (signal readonly), `add(telephone, type)`; chave `CALL_HISTORY_STORAGE_KEY = 'webphoneCallHistory'`.
- Tons Web Audio: `RingbackTone` (`start`/`stop`), `IncomingRingTone` (`start`/`stop`), `EndCallBeep` (`play`), `DtmfKeyTone` (`play(digit)`).
- `handleCalleId(callerId?)`, `telephoneFormat(tel?)` (`utils.ts`).
- Componentes: `WebphoneTopbarComponent` (`app-webphone-topbar`: atender/desligar, abrir sidebar) e `WebphoneSidebarComponent` (`app-webphone-sidebar`: discador, histórico, transferência, mute, desativar ramal).

## Invariants
- O UA JsSIP só é criado se `UserService.webphoneJsSipEnabledSignal()` for verdadeiro (ramal com endpoint e transporte `WSS`) e houver `endpoint` e `peerSecret`; `startJsSipIfEligible()` é idempotente (um único `UA`).
- URI SIP: `sip:<endpoint>_WSS@<PABX_URL>`, socket `wss://<PABX_URL>:8089/ws`, `authorization_user = endpoint`.
- Comandos de facilidade via DTMF: transferência cega `*1`, assistida `*2`, estacionar `*7`; só são enviados com estado `TALKING` e com intervalo mínimo de 1000 ms (`COMMAND_COOLDOWN_MS`).
- Ringback local só toca em `180` sem SDP (o PABX não envia early media) e para quando chega corpo/aceite.
- Ao encerrar a sessão (`session` indefinida), dígitos, modo de transferência e teclado são resetados.
- Histórico: só dígitos, `*` e `#`; sem duplicar o mesmo número (o mais recente vai ao topo); limite `MAX_ENTRIES = 50`; falhas de `localStorage` são ignoradas (fica só em memória).
- Chamada recebida que falha é registrada como `MISSED`; aceita como `INCOMING`; `makeCall` registra `OUTGOING`.

## Side Effects
- Conexão WebSocket SIP com `environment.PABX_URL` e registro SIP.
- Captura de microfone (`mediaConstraints: { audio: true }`) e reprodução de áudio remoto via `new Audio()`.
- Cabeçalho SIP `X-CALL-TOKEN: TOKEN_PLACEHOLDER` em chamadas de saída.
- `beforeunload` derruba chamadas em andamento (`TALKING`, `CALLING`, `INCOMING_CALL`).
- Leitura/escrita de `localStorage['webphoneCallHistory']`.
- Timers (`setInterval`) para o cronômetro da chamada.
- `WebphoneSidebarComponent.deactivatePeer()` chama `UserService.deactivateWebphoneRegistration()` (`DELETE /users/webphone`).

## Verification
- Run: `npm test` (na raiz de `frontend/`)
