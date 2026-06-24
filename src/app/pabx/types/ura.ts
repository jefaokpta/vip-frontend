import { UraAction } from '@/pabx/types/ura-action';

export interface Ura {
    readonly id: number;
    readonly name: string;
    readonly companyId: string;
    readonly interactionTimeout: number;
    readonly digitTimeout: number;
    readonly soundId: number;
    readonly isEnableDialPeer: boolean;
    readonly invalidAction: UraAction;
    readonly timeoutAction: UraAction;
    readonly actions: UraAction[];
}
