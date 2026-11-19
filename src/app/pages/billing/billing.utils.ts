import { BillingRunSummary } from '@/pages/billing/types';

export const POLLING_MS = 10_000;

/** Quantidade de clientes já processados (enviados, simulados ou com erro) de uma execução. */
export function processedCount(run: BillingRunSummary): number {
    const c = run.countsByStatus ?? {};
    return (c['ENVIADO'] ?? 0) + (c['SIMULADO'] ?? 0) + (c['ERRO'] ?? 0);
}
