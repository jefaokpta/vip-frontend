import {QueueStrategyEnum} from '@/pabx/types/queue-strategy-enum';

export interface Queue {
    readonly id: number;
    readonly name: string;
    readonly companyId: string;
    readonly queueStrategy: QueueStrategyEnum;
    readonly ringTimeout: number;
    readonly queueTimeout: number;
    readonly queueSoundId: number;
    readonly maxCalls: number;
    readonly weight: number;
    readonly serviceLevelSeconds: number;
    readonly tmeAlertSeconds: number;
    readonly callDurationAlertMinutes: number;
    readonly memberPauseDurationAlertMinutes: number;
    readonly memberIds: number[];
    readonly isJoinWhenEmpty: boolean;
    readonly cooldownSeconds: number;
    readonly surveyId?: number;
}
