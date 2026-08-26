export interface Worker {
    readonly id: number;
    readonly name: string;
    readonly isReady: boolean;
    readonly maxChannels: number;
    readonly channelIds: string[];
}
