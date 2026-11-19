# pages/billing

## Overview
Telas de Configurações > Financeiro (faturamento Omie): lista de execuções, detalhe de execução e configuração dos códigos de serviço Omie. Restritas a `ROLE_SAAS_FINANCE`.

## Interface
- `BillingService` (`billing.service.ts`) e tipos em `types.ts`.
- `BillingRunsPage` (`app-billing-runs-page`): `load()`, `start(mode)`, `resume(run)`, `cancel(run)`.
- `BillingRunDetailPage` (`app-billing-run-detail-page`): `load()`, `rerun(client)`.
- `OmieConfigPage` (`app-omie-config-page`): `save()`.
- Rotas (`billing.routes.ts`, em `/pages/billing`): `''`, `omie-config`, `:id`, todas com `roleGuard(ROLE_SAAS_FINANCE)`.

## Invariants
- "Executar faturamento" e "Simular" ficam desabilitados enquanto há execução ativa (`active`); "Reexecutar" idem.
- "Retomar" e "Encerrar" só aparecem para execuções `INTERROMPIDA`.
- Polling de 10 s só enquanto `active`; é interrompido quando deixa de estar ativo e em `ngOnDestroy`.
- "X de N" = ENVIADO + SIMULADO + ERRO sobre `totalClients`.

## Side Effects
- HTTP: `/billing/runs*`, `/billing/omie-config`.

## Verification
- Run: `npm test -- --watch=false --include='**/billing/*.spec.ts'`
