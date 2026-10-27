import {Peer} from '@/pabx/types/peer';

export interface PeerCredential {
    readonly peer: string;
    readonly md5Secret: string;
}

export interface PeerBatchResult {
    readonly created: Peer[];
    readonly skipped: string[];
    readonly credentials: PeerCredential[];
}
