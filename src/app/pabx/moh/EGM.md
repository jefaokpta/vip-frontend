# pabx/moh

## Overview
"Áudios do Sistema": cadastro de áudios (música de espera e mensagens) com upload do arquivo, definição de áudio padrão e um seletor reutilizável em outros formulários.

## Interface
- `MohService` (`moh.service.ts`): `findAll()` (com cache), `findById(id)`, `create(name, file)`, `update(id, name)`, `setDefault(id)`, `unsetDefault(id)`, `delete(id)`.
- `MohsPage` (`app-mohs-page`): `toggleDefault(moh)`, `confirmDelete(moh)`.
- `NewMohPage` (`app-new-moh-page`: `onFileChange`, `onSubmit`), `EditMohPage` (`app-edit-moh-page`).
- `AudioSelectComponent` (`app-audio-select-component`): `ControlValueAccessor` com valor `number | null`; `@Input() label`, `required`, `showError`, `isShowLabel`, `inputId`.
- Rotas: `mohs`, `mohs/new`, `mohs/edit/:id`.

## Invariants
- `findAll()` memoriza a Promise em `cachedFindAllPromise`; toda operação de escrita (`create`, `update`, `setDefault`, `unsetDefault`, `delete`) zera o cache.
- Upload em duas etapas: `POST /mohs` devolve `{ moh, uploadUrl }` e o arquivo é enviado com `PUT` direto para `uploadUrl`, sem cabeçalho de autenticação e com `Content-Type` do arquivo (default `audio/mpeg`).
- `update` envia só o nome (`FormData`).

## Side Effects
- HTTP: `GET|POST /mohs`, `GET|PUT|DELETE /mohs/{id}`, `PUT|DELETE /mohs/{id}/default` e `PUT` para a URL de upload pré-assinada devolvida pelo backend.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
