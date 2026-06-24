import { DialPlanAction } from '@/pabx/types/dial-plan-action';
import { SrcEnum } from '@/pabx/types/src-enum';

export interface DialPlan {
    readonly id: number;
    readonly name: string;
    readonly srcEnum: SrcEnum;
    readonly srcValue?: string;
    readonly dst?: string;
    readonly isAlwaysActive: boolean;
    readonly isActive: boolean;
    readonly priority: number;
    readonly companyId: string;
    readonly dstAlias?: number;
    readonly actions: DialPlanAction[];
}
