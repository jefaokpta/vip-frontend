import { ChannelStateEnum } from '@/pabx/types/channel-state-enum';
import { UserFieldEnum } from '@/pabx/types/user-field-enum';

export interface Channel {
    readonly uniqueId: string;
    readonly peer: string;
    readonly channelStateEnum: ChannelStateEnum;
    readonly isLeader: boolean;
    readonly timestamp: number;
    readonly record?: string;
    readonly connectedNumber?: string;
    readonly callTypeEnum?: UserFieldEnum;
}
