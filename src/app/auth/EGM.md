# auth

## Overview
Telas públicas de autenticação, montadas sob `/auth` (lazy em `app.routes.ts`): login, recuperação de senha, confirmação de e-mail por código, criação de nova senha e páginas estáticas de acesso negado, erro e bloqueio de tela.

## Interface
- Rotas (`auth.routes.ts`, export default): `access` → `Access`, `error` → `Error`, `login` → `Login`, `forgotpassword` → `ForgotPassword`, `newpassword` → `NewPassword`, `confirm-email` → `ConfirmEmailPage`, `**` → `/notfound`.
- `Login` (`login.ts`): formulário `email`/`password`; após autenticar navega para `returnUrl`.
- `ForgotPassword` (`forgotpassword.ts`): envia e-mail e navega para `/auth/confirm-email?e=<base64>` (`encodeEmailBase64`).
- `ConfirmEmailPage` (`confirm-email.page.ts`): código de 6 caracteres; em sucesso navega para `/auth/newpassword` com `email`.
- `NewPassword` (`newpassword.ts`): define senha e volta para `/auth/login`.
- `Access`, `Error`, `LockScreen`: componentes estáticos.

## Invariants
- `Login`: senha com `Validators.minLength(8)`.
- `NewPassword`: senha com `passwordStrengthValidator()` (maiúscula, minúscula, número e caractere especial) e `repeatPassword` obrigatório.
- `ConfirmEmailPage`: `code` exige exatamente 6 caracteres (`minLength(6)`/`maxLength(6)`).
- E-mail trafega entre telas em base64 (`e` em query param), não em texto puro.
- `ConfirmEmailPage` grava o token devolvido por `confirmEmail` (`loginSuccess`) para autorizar a definição de senha; `NewPassword` descarta esse token após `setPassword` para forçar login explícito com a senha nova.
- Estas rotas não passam por `authGuard`.

## Side Effects
- HTTP via `UserService`: `POST /auth/login`, `POST /auth/forgot-password`, `POST /auth/confirmation`, `POST /users/password`.
- `UserService.loginSuccess` grava `localStorage['token']`; `NewPassword` remove `localStorage['token']` após definir a senha.
- Navegação do roteador.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
