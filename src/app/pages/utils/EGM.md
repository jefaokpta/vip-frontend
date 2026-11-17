# pages/utils

## Overview
Validadores reativos de formulário reutilizados nas telas de senha (perfil e autenticação).

## Interface
- `matchPasswordValidator: ValidatorFn` (`validators.ts`): validador de grupo; compara os controles `password` e `repeatPassword` e retorna `{ passwordMustMatch: true }` se diferentes.
- `passwordStrengthValidator()` (`validators.ts`): retorna `{ passwordStrength: { missingUppercase?, missingLowercase?, missingNumber?, missingSpecialChar? } }` ou `null`.

## Invariants
- `passwordStrengthValidator` aceita valor vazio (retorna `null`); a obrigatoriedade fica a cargo de `Validators.required`.
- Uma senha forte exige maiúscula, minúscula, dígito e um caractere especial do conjunto `!@#$%^&*()_+-=[]{};':"\|,.<>/?`.
- `matchPasswordValidator` depende dos nomes de controle `password` e `repeatPassword`.

## Side Effects
- None

## Verification
- Run: `npm test` (na raiz de `frontend/`)
