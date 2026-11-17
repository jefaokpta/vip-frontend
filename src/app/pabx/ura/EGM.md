# pabx/ura

## Overview
CRUD de URAs (IVR): áudio de menu, timeouts, discagem direta de ramal, ações por dígito (0-9) e ações para opção inválida e para timeout.

## Interface
- `UraService` (`ura.service.ts`): `findAll()`, `findById(id)`, `create(ura: Partial<Ura>)`, `update(ura)`, `delete(id)`.
- `UrasPage` (`app-uras-page`): `confirmDelete(ura)`.
- `NewUraPage` (`app-new-ura-page`) e `EditUraPage` (`app-edit-ura-page`): `addAction()`, `removeAction(index)`, `onActionTypeChange(group)`, `onSubmit()`; validadores estáticos `requireTargetValidator` e `noDuplicateOptions`.
- Rotas: `uras`, `uras/new`, `uras/edit/:id`.

## Invariants
- Cada ação tem `option` entre 0 e 9; o `FormArray` de ações exige ao menos uma e não aceita dígitos repetidos (`{ duplicateOptions: true }`).
- Ações `DIALPEER`, `CALLGROUP`, `SUBURA` e `QUEUE` exigem `target` (`{ targetRequired: true }`); `HANGUP`, `RETURN_TO_START` e `DIALPLAN` não passam por essa exigência.
- `interactionTimeout` e `digitTimeout` >= 1 (defaults 5 e 2 na criação).
- A ação `DIALPLAN` só oferece regras com `isActive`, ordenadas por `sortDialplansByDstAndPriority`.
- Os validadores são duplicados em `NewUraPage` e `EditUraPage`; altere os dois juntos.

## Side Effects
- HTTP: `GET|POST /uras`, `GET|PUT|DELETE /uras/{id}`; os formulários carregam opções via `MohService`, `CallGroupService`, `UraService`, `QueueService`, `DialPlanService` e `AliasService`.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
