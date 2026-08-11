import {PeerRegistry} from '@/pabx/types/peer-registry';
import {QueueMemberStatusEnum} from '@/pabx/types/queue-member-status-enum';

export interface QueueMember {
    readonly id: number;
    readonly name: string;
    readonly peerRegistry: PeerRegistry;
    readonly queueMemberStatusEnum: QueueMemberStatusEnum;
    readonly pauseTimestamp?: number;
    readonly pausaId?: number;
    readonly pausaName?: string;
    readonly pausaTimeLimitMinutes?: number;
    readonly lastCallTimestamp?: number;
    readonly answeredCallCount?: number;
}
