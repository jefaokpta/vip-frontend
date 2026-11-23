# pages/dashboard/components

## Overview
Componentes de apresentação que recebem uma lista de CDRs e exibem gráficos e cartões de resumo. Nenhum arquivo `.ts` do app os importa hoje (verificado por busca de seletores e nomes de classe).

## Interface
- `CallOverviewComponent` (`app-call-overview-component`, `call-overview.component.ts`): `@Input() cdrsInput: Cdr[]`; gráfico Chart.js recriado em `ngOnChanges`.
- `StatsCardsComponent` (`app-stats-cards-component`, `stats-cards.component.ts`): `@Input() cdrsInput: Cdr[]`; getters `totalConversation` (minutos de `billableSeconds`, arredondado para cima) e `totalAnalysis` (CDRs com `status === CallAnalyzeStatusEnum.FINISHED`).
- `TemperatureComponent` (`app-temperature-component`, `temperature.component.ts`): `@Input() cdrsInput: Cdr[]`; gráfico de pizza por `TemperatureEnum` (`QUENTE`, `MORNA`, `FRIA`).

## Invariants
- Componentes puros de entrada: não fazem HTTP; recalculam apenas em `ngOnChanges`.
- As cores dos gráficos vêm de variáveis CSS lidas com `getComputedStyle(document.documentElement)`.

## Side Effects
- `CallOverviewComponent` assina eventos de tema e cancela a assinatura em `ngOnDestroy`.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
