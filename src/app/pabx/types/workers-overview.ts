export interface CompanyChannels {
    readonly companyId: string;
    readonly channels: number;
}

export interface WorkerOverview {
    readonly workerId: string;
    readonly channels: number;
    readonly companies: CompanyChannels[];
}

export interface WorkersOverview {
    readonly totalChannels: number;
    readonly workers: WorkerOverview[];
}
