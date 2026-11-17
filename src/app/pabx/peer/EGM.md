# pabx/peer

## Overview
Administração de ramais SIP: listagem, criação individual, criação em lote (com download das credenciais em CSV), edição, exclusão e liberação do ramal vinculado a um usuário.

## Interface
- `PeerService` (`peer.service.ts`): `findAll()`, `findAvailable()`, `findById(id)`, `create(peer)`, `createBatch(newPeerBatch)`, `update(peer)`, `delete(id)`, `releaseFromUser(id)`.
- `PeerPage` (`app-peer-page`): `onBatchCreated(result)`, `confirmDelete(peer)`, `confirmRelease(peer)`.
- `NewPeerPage` (`app-new-peer-page`) e `EditPeerPage` (`app-edit-peer-page`): formulário do ramal, geração/cópia de senha, `onSubmit()`.
- `NewPeerBatchDialogComponent` (`app-new-peer-batch-dialog`): `@Input() visible`, `@Output() visibleChange`, `@Output() created: EventEmitter<PeerBatchResult>`.
- Rotas: `peers`, `peers/new`, `peers/edit/:id`.

## Invariants
- O número do ramal (`peer`) tem 2 a 4 dígitos (`[0-9]+`, `minLength(2)`, `maxLength(4)`).
- Ramal novo nasce com transportes `[PeerTransportEnum.UDP, PeerTransportEnum.WSS]`; o WSS é o que habilita o webphone JsSIP.
- Senha gerada com `generateAlphanumericSecret()` (`@/pabx/utils`, 16 caracteres, mesmo formato do backend). Na edição o controle `md5Secret` só existe quando o usuário opta por trocar a senha.
- Lote: `startRange`/`endRange` entre 10 e 9999; ramais já existentes são ignorados (`PeerBatchResult.skipped`).

## Side Effects
- HTTP: `GET|POST /peers`, `GET /peers/available`, `POST /peers/batch`, `GET|PUT|DELETE /peers/{id}`, `DELETE /peers/{id}/user`.
- Após o lote, gera e baixa `ramais-<data>.csv` (`ramal,senha`) via `Blob`/`URL.createObjectURL` e um `<a>` temporário.
- `navigator.clipboard` ao copiar a senha, com `setTimeout` de 2 s para o feedback de "copiado".

## Verification
- Run: `npm test` (na raiz de `frontend/`)
