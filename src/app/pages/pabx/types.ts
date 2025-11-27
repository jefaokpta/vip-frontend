import {CallAnalyzeStatusEnum, SentimentEnum, TemperatureEnum} from "@/types/types";


export interface Alias {
    readonly id: number;
    name: string;
    companyId: string;
    expressions: AliasExpression[]
}

export interface AliasExpression {
    readonly id: number;
    readonly expression: string;
    readonly aliasId: number;
}

export enum PeerStateEnum {
    UNKNOWN = 'UNKNOWN',
    NOT_INUSE = 'NOT_INUSE',
    INUSE = 'INUSE',
    BUSY = 'BUSY',
    INVALID = 'INVALID',
    UNAVAILABLE = 'UNAVAILABLE',
    RINGING = 'RINGING',
    RINGINUSE = 'RINGINUSE',
    ONHOLD = 'ONHOLD'
}

export interface PeerState {
    readonly serverId: string,
    readonly endpoint: string,
    readonly state: PeerStateEnum
}

export interface Peer {
    readonly id: number,
    readonly name: string,
    readonly peer: string,
    readonly companyId: string,
    readonly endpointStates: PeerState[]
}

export enum UserFieldEnum {
    OUTBOUND = 'OUTBOUND',
    INBOUND = 'INBOUND',
    UPLOAD = 'UPLOAD',
    TEST = 'TEST',
}

export interface Cdr {
    readonly id: number;
    readonly startTime: Date;
    readonly peer: string;
    readonly src: string;
    readonly destination: string;
    readonly callerId: string;
    readonly uniqueId: string;
    readonly disposition: string;
    readonly userfield: UserFieldEnum;
    readonly callRecord: string;
    status: CallAnalyzeStatusEnum;
    title: string;
    readonly summary: string;
    readonly sentiment: SentimentEnum;
    temperature: TemperatureEnum;
    engagement: number;
    readonly mostFrequentWords: string;
    readonly action: string;
    readonly billableSeconds: number;
}

