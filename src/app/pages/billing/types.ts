export type FranchiseType = 'CONSUMO' | 'MINUTOS';
export type BillingMode = 'REAL' | 'SIMULACAO';

export interface CompanyBilling {
    companyId: string;
    franchiseType: FranchiseType;
    franchiseValue: number;
    franchiseMinutes: number;
    exceedingMinuteRate: number;
    franchise0800: number;
    franchise4000: number;
}

export type CompanyBillingDTO = Omit<CompanyBilling, 'companyId'>;

export interface OmieConfig {
    codServicoConsumo: number;
    codServicoMinutos: number;
    codServicoInternacional: number;
    codServico0800: number;
    codServico4000: number;
}

export interface BillingRunSummary {
    id: number;
    mode: BillingMode;
    status: string;
    periodStart: string;
    periodEnd: string;
    createdBy: string;
    createdAt: string;
    finishedAt: string | null;
    totalClients: number;
    countsByStatus: Record<string, number>;
}

export interface BillingRunList {
    active: boolean;
    runs: BillingRunSummary[];
}

export interface CalcJsonItem {
    codServico: number;
    codItem: number;
    rawValue: number;
    value: number;
}

export interface CalcJson {
    params: CompanyBilling;
    costByClass: Record<string, number>;
    secondsByClass: Record<string, number>;
    minutes: number | null;
    cost0800: number;
    cost4000: number;
    unclassifiedLegs: number;
    items: CalcJsonItem[];
    roundingDiff?: number | null;
}

export interface BillingRunClient {
    companyId: string;
    status: string;
    errorCode: string | null;
    errorDetail: string | null;
    calc: CalcJson | null;
    lastSentAt: string | null;
}

export interface BillingRunDetail {
    summary: BillingRunSummary;
    orphanContracts: string[];
    clients: BillingRunClient[];
}
