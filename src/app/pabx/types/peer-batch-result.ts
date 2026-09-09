import {Peer} from '@/pabx/types/peer';

export interface PeerBatchResult {
    readonly created: Peer[];
    readonly skipped: string[];
}
