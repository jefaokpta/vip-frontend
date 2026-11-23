# pages/pabx-features

## Overview
Página estática "Facilidades do PABX" que documenta para o usuário final os códigos de facilidade (ex.: transferência cega `*1`) e como usá-los.

## Interface
- `PabxFeaturesPage` (`p-pabx-features`, `pabx-features.page.ts`): `groups: FeatureGroup[]` com `title` e `features` (`name`, `code`, `when`, `summary`, `steps`, `notes`).

## Invariants
- Os códigos descritos aqui devem bater com os enviados pelo webphone (`*1`, `*2`, `*7` em `webphone.service.ts`) e com o dialplan do PABX; o conteúdo é texto fixo, sem consulta ao backend.

## Side Effects
- None

## Verification
- Run: `npm test` (na raiz de `frontend/`)
