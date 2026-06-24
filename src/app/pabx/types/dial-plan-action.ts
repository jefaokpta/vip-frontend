import { DialPlanActionEnum } from '@/pabx/types/dial-plan-action-enum';

export interface DialPlanAction {
    readonly actionEnum: DialPlanActionEnum;
    readonly priority: number;
    readonly arg1?: string;
    readonly arg2?: string;
    readonly arg3?: string;
    readonly arg4?: string;
    readonly arg5?: string;
}
