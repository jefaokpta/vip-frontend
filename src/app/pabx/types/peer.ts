import { DtmfModeEnum } from '@/pabx/types/dtmf-mode-enum';
import { LanguageEnum } from '@/pabx/types/language-enum';
import { PeerTransportEnum } from '@/pabx/types/peer-transport-enum';

export interface Peer {
    readonly id: number;
    readonly name: string;
    readonly peer: string;
    readonly companyId: string;
    readonly featurePassword: string;
    readonly language: LanguageEnum;
    readonly pickUpGroup?: string;
    readonly peerTransportEnums: PeerTransportEnum[];
    readonly qualify: boolean;
    readonly nat: boolean;
    readonly dtmfModeEnum: DtmfModeEnum;
    readonly callLimit: number;
}
