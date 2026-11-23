import {Channel} from '@/pabx/types/channel';
import {ContactStatusEventEnum} from '@/pabx/types/contact-status-event-enum';
import {Peer} from '@/pabx/types/peer';
import {PeerTransportEnum} from '@/pabx/types/peer-transport-enum';

export interface PeerRegistry {
    readonly id: string;
    readonly peer: Peer;
    readonly registerId?: string;
    readonly contactStatusEventEnum: ContactStatusEventEnum;
    /** Status de cada tech presente; o contactStatusEventEnum é o agregado delas. */
    readonly transports?: Partial<Record<PeerTransportEnum, ContactStatusEventEnum>>;
    readonly channel?: Channel;
}
