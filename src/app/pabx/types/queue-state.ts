import {Channel} from '@/pabx/types/channel';
import {Queue} from '@/pabx/types/queue';
import {QueueMember} from '@/pabx/types/queue-member';

export interface QueueState {
    readonly queue: Queue;
    readonly loggedMembers: QueueMember[];
    readonly waitingCalls: Channel[];
    readonly abandonedCalls?: number;
    readonly answeredCalls?: number;
    readonly answeredCallsInServiceLevel?: number;
    readonly tmeSeconds?: number;
}
