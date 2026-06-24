import { Channel } from '@/pabx/types/channel';
import { Queue } from '@/pabx/types/queue';
import { QueueMember } from '@/pabx/types/queue-member';

export interface QueueState {
    readonly queue: Queue;
    readonly loggedMembers: QueueMember[];
    readonly waitingCalls: Channel[];
    readonly mostWaitingCallTimestamp?: number;
    readonly longestHoldTime?: number;
    readonly talkedTime?: number;
    readonly abandonedCalls?: number;
    readonly answeredCalls?: number;
    readonly answeredCallsInServiceLevel?: number;
}
