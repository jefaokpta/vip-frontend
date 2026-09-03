export interface QueueOption {
    id: number;
    name: string;
}

export type DacPartialGranularity = 'HOUR' | 'DAY';

export interface DacPartial {
    periodStart: number;
    totalCalls: number;
    answeredCalls: number;
    abandonedCalls: number;
    avgWaitSeconds: number;
    avgTalkSeconds: number;
}

export interface DacReportResponse {
    queueId: number;
    granularity: DacPartialGranularity;
    serviceLevelSeconds: number;
    totalCalls: number;
    answeredCalls: number;
    abandonedCalls: number;
    avgWaitSeconds: number;
    avgTalkSeconds: number;
    serviceLevelPercent: number;
    partials: DacPartial[];
}
