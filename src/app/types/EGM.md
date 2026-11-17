# types

## Overview
Tipos de domínio compartilhados pelo app inteiro (usuário, empresa, tenant, telefonia web, transcrição, IPs bloqueados). Apenas declarações TypeScript, sem lógica. Tipos específicos do PABX ficam em [`../pabx/types/EGM.md`](../pabx/types/EGM.md).

## Interface
- Usuário e acesso: `User` (`user.ts`), `LoginResponse` (`login-response.ts`), `RoleEnum` (`role-enum.ts`), `ModuleEnum` (`module-enum.ts`: `PABX`, `VIDEO`, `VENDAS`, `SAC`), `ServiceEnum` (`service-enum.ts`: `PABX`, `IA`, `VIDEO`, `VENDAS`, `SAC`).
- Empresa e tenant: `Company`, `NewCompany` (`company.ts`), `Tenant`, `NewTenant` (`tenant.ts`).
- Infraestrutura: `RegisterInstance`, `NewRegisterInstance` (`register-instance.ts`), `WorkerInstance`, `NewWorkerInstance` (`worker-instance.ts`), `Worker` (`worker.ts`).
- Webphone: `PhoneState` (`phone-state.ts`, contém `RTCSession` do JsSIP), `PhoneStateEnum` (`phone-state-enum.ts`, valores em português), `PeerRegistration` (`peer-registration.ts`), `CallHistory`, `CallHistoryType` (`call-history.ts`).
- IA e atendimento: `Transcription`, `TranscriptionSummary`, `TranscriptionUtterance`, `TranscriptionStatus` (`transcription.ts`), `CallAnalyzeStatusEnum`, `SentimentEnum`, `TemperatureEnum`, `Attendant`, `AttendantTypeEnum`.
- Segurança: `BlockedIp`, `BlockedIpOrigin` (`'MANUAL' | 'AUTO'`), `BlockedIpStatus` (`'BLOCKED' | 'ALLOWED'`) (`blocked-ip.ts`).

## Invariants
- `RoleEnum` está declarado em ordem crescente de hierarquia (`ROLE_COMPANY_USER` ... `ROLE_SAAS_ADMIN`); `canManageUser` em `pages/users/utils.ts` usa o índice do enum como nível. Não reordene os membros.
- `ModuleEnum` (o que o usuário pode acessar, vindo do JWT em `User.modules`) e `ServiceEnum` (serviços contratados pela empresa, `User.companyServices`) são conceitos distintos.
- Os valores de `PhoneStateEnum` são rótulos exibidos na UI.
- Os campos espelham contratos JSON do backend; mudar nomes quebra a desserialização.

## Side Effects
- None

## Verification
- Run: `npm test` (na raiz de `frontend/`)
