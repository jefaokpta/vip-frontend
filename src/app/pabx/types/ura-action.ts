import { UraActionEnum } from '@/pabx/types/ura-action-enum';

export interface UraAction {
    readonly option: number;
    readonly uraActionEnum: UraActionEnum;
    readonly target?: string;
}
