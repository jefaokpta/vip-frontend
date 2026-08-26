import {UserFieldEnum} from '@/pabx/types/user-field-enum';

export interface CdrChannel {
    readonly uniqueId: string;
    readonly peer: string;
    readonly isLeader: boolean;
}

export interface ChannelInteraction {
    readonly channelSrc: CdrChannel;
    readonly channelDst: CdrChannel | null;
    readonly recordingUrl: string | null;
}

export interface CdrDetail {
    readonly id: number;
    readonly peer: string;
    readonly src: string;
    readonly destination: string;
    readonly callerId: string;
    readonly duration: number;
    readonly billableSeconds: number;
    readonly uniqueId: string;
    readonly disposition: string;
    readonly startTime: Date;
    readonly channel: string;
    readonly userfield: UserFieldEnum;
    readonly destinationChannel: string;
    readonly accountCode: string | null;
    readonly cost: number;
    readonly interactions: ChannelInteraction[];
}
