export interface UraSelection {
    readonly id: number;
    readonly companyId: string;
    readonly uraId: number;
    readonly callId: string;
    readonly callerId: string;
    readonly optionDigit: number;
    readonly actionType: string;
    readonly target?: string;
    readonly createdAt: Date;
}
