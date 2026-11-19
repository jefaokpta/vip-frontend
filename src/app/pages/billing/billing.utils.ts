import { BillingRunSummary } from '@/pages/billing/types';

export const POLLING_MS = 10_000;

/** Quantidade de clientes já processados (enviados, simulados ou com erro) de uma execução. */
export function processedCount(run: BillingRunSummary): number {
    const c = run.countsByStatus ?? {};
    return (c['ENVIADO'] ?? 0) + (c['SIMULADO'] ?? 0) + (c['ERRO'] ?? 0);
}

/**
 * Último dia incluído no período: o backend grava `periodEnd` exclusivo (dia 26 00:00),
 * então exibimos o dia anterior. Lê só a parte de data para não depender de fuso.
 */
export function inclusivePeriodEnd(periodEnd: string): Date {
    const [y, m, d] = periodEnd.substring(0, 10).split('-').map(Number);
    return new Date(y, m - 1, d - 1);
}
