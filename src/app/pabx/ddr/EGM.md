# pabx/ddr

## Overview
CRUD de DDRs (números de entrada da empresa), com formatação/validação de número brasileiro e definição do DDR padrão.

## Interface
- `DdrService` (`ddr.service.ts`): `findAll()`, `findById(id)`, `create(ddr)`, `update(ddr)`, `setDefault(id)`, `delete(id)`.
- `DdrPage` (`app-ddr-page`): `setDefault(ddr)`, `confirmDelete(ddr)`.
- `NewDdrPage` (`app-new-ddr-page`), `EditDdrPage` (`app-edit-ddr-page`).
- `DdrFieldComponent` (`app-ddr-field`): `@Input({required: true}) control: FormControl`; aplica máscara ao digitar.
- `ddr-format.ts`: `DDR_MAX_DIGITS = 14`, `onlyDigits(value)`, `isValidDdr(digits)`, `formatDdr(ddr)`, `ddrValidator`.
- Rotas: `ddrs`, `ddrs/new`, `ddrs/edit/:id`.

## Invariants
- Formatos aceitos (só dígitos): DDD+tel (10-11), OP+DDD+tel (12-13), 0+OP+DDD+tel (13-14) e 0800 + 7 dígitos (11). Com 13 dígitos, iniciar com `0` indica 0+OP+DDD+tel de 8 dígitos; senão OP+DDD+tel de 9.
- `ddrValidator` retorna `{ ddrFormat: true }` para formato inválido e `null` para vazio (a obrigatoriedade é do `Validators.required`).
- `formatDdr` devolve o valor original quando não reconhece o formato.
- Definir padrão usa endpoint dedicado (`PUT /ddrs/{id}/default`).

## Side Effects
- HTTP: `GET|POST /ddrs`, `GET|PUT|DELETE /ddrs/{id}`, `PUT /ddrs/{id}/default`.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
