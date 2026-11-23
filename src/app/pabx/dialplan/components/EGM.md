# pabx/dialplan/components

## Overview
Componentes de formulário (`ControlValueAccessor`) que editam os argumentos de cada tipo de ação de dialplan, mais seletores reutilizáveis de ramal, alias e tronco. São usados pelos templates `new-dialplan.page.html` e `edit-dialplan.page.html`; `PeerSelectComponent` e `AliasSelectComponent` também aparecem em outras telas.

## Interface
- Ações (o valor do controle é `arg1`; argumentos extras são `@Input`/`@Output` com sufixo `Change`):
  - `PeerActionComponent` (`app-peer-action-component`): `flags`/`flagsChange`, `timeout`/`timeoutChange` (default `DEFAULT_DIAL_PEER_TIMEOUT`), `timeoutError`.
  - `AccountCodeActionComponent` (`app-account-code-action-component`).
  - `RouteActionComponent` (`app-route-action-component`), `CallGroupActionComponent` (`app-call-group-action-component`), `UraActionComponent` (`app-ura-action-component`), `QueueActionComponent` (`app-queue-action-component`), `PlaybackActionComponent` (`app-playback-action-component`).
  - `CalendarActionComponent` (`app-calendar-action-component`): `arg2`/`arg2Change`, `arg3`/`arg3Change`; `addCalendar(id)`, `removeCalendar(id)`.
  - `VariableActionComponent` (`app-variable-action-component`): `varValue`/`varValueChange`, `showVarValueError`.
  - `EditDstActionComponent` (`app-edit-dst-action-component`): `cutNumber`, `isReplaceAllDst`, `isCutInPipe` (cada um com `...Change`).
  - `AnswerActionComponent` (`app-answer-action-component`) e `HangupActionComponent` (`app-hangup-action-component`): sem argumentos.
- Seletores:
  - `PeerSelectComponent` (`app-peer-select-component`): `isShowLabel`, `isOnlyWSS`, `isShowAnyPeerLabel`, `isOnDialplanAction`, `isOnlyAvailable`.
  - `AliasSelectComponent` (`app-alias-select-component`), `TrunkSelectComponent` (`app-trunk-select-component`, `isShowAnyTrunkLabel`).
- Todos aceitam `@Input() showError` (exceto answer/hangup).

## Invariants
- `CalendarActionComponent` aceita no máximo 3 calendários distintos, gravados em `arg1`, `arg2` e `arg3` na ordem de seleção.
- `PeerSelectComponent`: ordena ramais numericamente; `isShowAnyPeerLabel` adiciona `TODOS` (`ANY`); `isOnDialplanAction` adiciona `DESTINO` (`DST`); `isOnlyWSS` mantém só ramais com transporte `WSS`; `isOnlyAvailable` usa `PeerService.findAvailable()` (usado no diálogo de ativação do webphone).
- `TrunkSelectComponent` usa `TrunkService.findOptions()` (visão mínima `id`/`name`), não a lista completa de troncos.
- Os valores trafegam como string (ids convertidos com `toString()`).

## Side Effects
- Cada componente carrega suas opções no `ngOnInit`: `AccountCodeService.findAll`, `RouteService.findAll`, `CallGroupService.findAll`, `UraService.findAll`, `QueueService.findAll`, `MohService.findAll`, `CalendarService.findAll`, `PeerService.findAll|findAvailable`, `AliasService.findAll`, `TrunkService.findOptions`.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
