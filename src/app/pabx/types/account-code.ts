export interface AccountCode {
    readonly id: number;
    readonly companyId: string;
    readonly code: string;
    readonly title: string;
    readonly cadence: number;
    readonly fraction: number;
    readonly cost: number;
    readonly updatedAt?: Date;
}
