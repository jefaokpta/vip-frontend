# pabx/types

## Overview
Tipos de domínio do PABX (um arquivo por tipo): entidades administráveis, estados em tempo real, relatórios e enums. Apenas declarações TypeScript que espelham os contratos JSON do backend.

## Interface
- Entidades: `AccountCode`, `Alias`, `AliasExpression`, `Calendar`, `CallGroup`, `Ddr`, `DialPlan`, `DialPlanAction`, `ExtraConfig`, `Moh`, `Pause`, `Peer`, `PickupGroup`, `Queue`, `Route`, `RouteTrunk`, `Survey`, `Trunk`, `TrunkOption` (`Pick<Trunk, 'id' | 'name'>`), `Ura`, `UraAction`.
- Lote de ramais: `NewPeerBatch`, `PeerBatchResult`, `PeerCredential`.
- Tempo real: `PeerRegistry`, `Channel`, `CompanyChannels`, `QueueState`, `QueueMember`, `WorkerOverview`, `WorkersOverview`.
- Relatórios: `Cdr`, `CdrDetail`, `CdrChannel`, `ChannelInteraction`, `HourlyCalls`, `DacReportResponse`, `DacPartial`, `DacPartialGranularity` (`'HOUR' | 'DAY'`), `DacCallsResponse`, `CallJourney`, `CallJourneyEvent`, `QueueJourneyEvent`, `CallStatus` (`'ANSWERED' | 'ABANDONED'`), `RecordingUrlResponse`, `QueueOption`, `MemberActivity`, `MemberActivityPause`, `MemberActivitySession`, `MemberActivityReportResponse`, `SurveyResponse`, `UraSelection`.
- Enums: `CalendarTypeEnum`, `CallGroupStrategyEnum`, `ChannelStateEnum`, `CodecEnum`, `ContactStatusEventEnum`, `DialPlanActionEnum`, `DtmfModeEnum`, `LanguageEnum`, `PeerStateEnum`, `PeerTransportEnum`, `QueueMemberStatusEnum`, `QueueStrategyEnum`, `SrcEnum`, `TechnologyEnum`, `UraActionEnum`, `UserFieldEnum`, `WeekDayEnum`.

## Invariants
- `QueueOption` é declarada em dois arquivos (`dac-report.ts` e `member-activity.ts`); importe do arquivo do relatório correspondente.
- Os nomes de campos e valores de enum são contrato com o backend; renomear quebra a serialização.
- `PeerTransportEnum.WSS` em `Peer.peerTransportEnums` é o que habilita o webphone JsSIP.

## Side Effects
- None

## Verification
- Run: `npm test` (na raiz de `frontend/`)
