import { CallAnalyzeStatusEnum, SentimentEnum, TemperatureEnum } from '@/types/types';

export interface Alias {
    readonly id: number;
    readonly name: string;
    readonly companyId: string;
    readonly expressions: AliasExpression[];
}

export interface AliasExpression {
    readonly id: number;
    readonly expression: string;
    readonly aliasId: number;
}

export enum SrcEnum {
    ANY = 'ANY',
    PEER = 'PEER',
    ALIAS = 'ALIAS',
    EXPRESSION = 'EXPRESSION',
    TRUNK = 'TRUNK'
}

export enum DialPlanActionEnum {
    ANSWER = 'ANSWER',
    HANGUP = 'HANGUP',
    PLAYBACK = 'PLAYBACK',
    SET_VARIABLE = 'SET_VARIABLE',
    DIAL_ROUTE = 'DIAL_ROUTE',
    DIAL_PEER = 'DIAL_PEER',
    ACCOUNT_CODE = 'ACCOUNT_CODE',
    EDIT_DST = 'EDIT_DST'
}

export interface DialPlanAction {
    readonly actionEnum: DialPlanActionEnum;
    readonly priority: number;
    readonly arg1?: string;
    readonly arg2?: string;
    readonly arg3?: string;
    readonly arg4?: string;
    readonly arg5?: string;
}

export interface DialPlan {
    readonly id: number;
    readonly name: string;
    readonly srcEnum: SrcEnum;
    readonly srcValue?: string;
    readonly dst?: string;
    readonly isAlwaysActive: boolean;
    readonly isActive: boolean;
    readonly priority: number;
    readonly companyId: string;
    readonly startTime?: Date;
    readonly endTime?: Date;
    readonly monday?: boolean;
    readonly tuesday?: boolean;
    readonly wednesday?: boolean;
    readonly thursday?: boolean;
    readonly friday?: boolean;
    readonly saturday?: boolean;
    readonly sunday?: boolean;
    readonly dstAlias?: number;
    readonly actions: DialPlanAction[];
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

export enum PeerTransportEnum {
    UDP = 'UDP',
    TCP = 'TCP',
    TLS = 'TLS',
    WSS = 'WSS'
}

export interface Peer {
    readonly id: number;
    readonly name: string;
    readonly peer: string;
    readonly companyId: string;
    readonly featurePassword: string;
    readonly language: LanguageEnum;
    readonly pickUpGroup: string;
    readonly callGroup: string;
    readonly peerTransportEnums: PeerTransportEnum[];
    readonly qualify: boolean;
    readonly nat: boolean;
    readonly dtmfModeEnum: DtmfModeEnum;
    readonly callLimit: number;
}

export enum UserFieldEnum {
    OUTBOUND = 'OUTBOUND',
    INBOUND = 'INBOUND',
    UPLOAD = 'UPLOAD',
    TEST = 'TEST'
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

export interface AccountCode {
    readonly id: number;
    readonly companyId: string;
    readonly code: string;
    readonly title: string;
    readonly cadence: number;
    readonly fraction: number;
    readonly cost: number;
    readonly updatedAt?: Date;
}

export interface Trunk {
    readonly id: number;
    readonly companyId: string;
    readonly name: string;
    readonly username: string;
    readonly secret: string;
    readonly host: string;
    readonly port: number;
    readonly peerQualify: boolean;
    readonly callLimit: number;
    readonly language: LanguageEnum;
    readonly dtmfMode: DtmfModeEnum;
    readonly technology: TechnologyEnum;
    readonly codecs: CodecEnum[];
    readonly techPrefix: string;
    readonly extraConfigs: ExtraConfig[];
}

export enum LanguageEnum {
    pt_BR = 'pt_BR',
    en = 'en',
    es = 'es',
    fr = 'fr'
}

export enum DtmfModeEnum {
    RFC4733 = 'RFC4733',
    INBAND = 'INBAND',
    INFO = 'INFO'
}

export enum TechnologyEnum {
    SIP = 'SIP'
}

export enum CodecEnum {
    G729 = 'G729',
    G722 = 'G722',
    ALAW = 'ALAW',
    ULAW = 'ULAW',
    GSM = 'GSM'
}

export interface ExtraConfig {
    readonly name: string;
    readonly value: string;
}
export interface RouteTrunk {
    readonly accountCode: string;
    readonly trunk1: number;
    readonly trunk2: number;
    readonly trunk3: number;
}

export interface Route {
    readonly id: number;
    readonly name: string;
    readonly companyId: string;
    readonly timeout: number;
    readonly flags: string;
    readonly routeTrunks: RouteTrunk[];
}
