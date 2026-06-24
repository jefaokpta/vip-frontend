import { CallGroupStrategyEnum } from '@/pabx/types/call-group-strategy-enum';

export interface CallGroup {
    readonly id: number;
    readonly name: string;
    readonly companyId: string;
    readonly callGroupStrategyEnum: CallGroupStrategyEnum;
    readonly peerIds: number[];
    readonly timeout: number;
    readonly groupTimeout: number;
}
