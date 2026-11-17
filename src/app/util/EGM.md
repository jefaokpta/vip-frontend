# util

## Overview
Utilitários transversais: wrapper de requisição HTTP com timeout, cabeçalho de autenticação, helpers de e-mail, PickList e serviço de título da aba.

## Interface
- `executeRequest<T>(request: Observable<T>, requestTimeout = 5_000): Promise<T>` (`utils.ts`): aplica `timeout` e converte com `firstValueFrom`. Padrão usado por todos os serviços HTTP do app.
- `httpHeaders()` (`utils.ts`): retorna `{ headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } }`.
- `encodeEmailBase64(email)`, `decodeEmailBase64(value)` (`utils.ts`): `btoa`/`atob` para query params (ofuscação, não criptografia).
- `maskEmail(email)` (`utils.ts`): mascara para exibição, ex.: `jo***@ho***.com`.
- `transferPickListItems<T extends { id: number }>(items, from, to): [T[], T[]]` (`utils.ts`): devolve novos arrays `[origem, destino]` sem duplicar itens.
- `TitleService` (`title.service.ts`, `providedIn: 'root'`): `initializeTitleListener()` e `setTitle(newTitle)`; título base `'Iasmin'`.

## Invariants
- O timeout padrão de `executeRequest` é 5 s; chamadas mais lentas devem passar timeout explícito (ex.: relatórios usam `10_000`).
- `httpHeaders()` lê o token no momento da chamada; não há interceptor HTTP, cada serviço deve passar `httpHeaders()` explicitamente.
- `transferPickListItems` sempre reconstrói os dois lados a partir dos ids movidos, porque o PickList muta os arrays nos botões e o listbox só refaz o filtro com nova referência.
- `TitleService` usa o `data.breadcrumb` da rota filha mais profunda: título fica `Iasmin - <breadcrumb>` ou só `Iasmin`.

## Side Effects
- `httpHeaders()` lê `localStorage['token']`.
- `TitleService` assina `Router.events` (`NavigationEnd`) e altera o título do documento.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
