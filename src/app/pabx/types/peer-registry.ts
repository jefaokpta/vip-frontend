import { Channel } from '@/pabx/types/channel';
import { ContactStatusEventEnum } from '@/pabx/types/contact-status-event-enum';
import { Peer } from '@/pabx/types/peer';

export interface PeerRegistry {
    readonly id: string;
    readonly peer: Peer;
    readonly registerId?: string;
    readonly contactStatusEventEnum: ContactStatusEventEnum;
    readonly channel?: Channel;
}
