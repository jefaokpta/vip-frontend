import { PeerTransportEnum } from '@/pabx/types/peer-transport-enum';

export interface PeerRegistration {
    readonly id?: string;
    readonly name?: string;
    readonly endpoint?: string;
    readonly peerSecret?: string;
    readonly peerTransportEnums?: PeerTransportEnum[];
}
