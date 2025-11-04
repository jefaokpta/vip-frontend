/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 4/22/25
 */
import {RTCSession} from 'jssip/lib/RTCSession';

export interface LoginResponse {
    readonly token: string;
}

export enum SentimentEnum {
    POSITIVO = 'POSITIVO',
    NEGATIVO = 'NEGATIVO',
    NEUTRO = 'NEUTRO'
}

export enum TemperatureEnum {
    FRIA = 'FRIA',
    MORNA = 'MORNA',
    QUENTE = 'QUENTE',
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

export enum CallLegEnum {
    A = 'A',
    B = 'B',
    BOTH = 'BOTH',
}

export interface Segment {
    readonly id: number;
    readonly segmentId: number;
    readonly text: string;
    readonly seek: number;
    readonly callLeg: CallLegEnum
    readonly startSecond: number;
    readonly endSecond: number;
}

export interface Recognition {
    readonly id: number;
    readonly uniqueId: string;
    segments: Segment[];
}

export enum RoleEnum {
    FREE = 'free',
    USER = 'user',
    ADMIN = 'admin',
    SUPER = 'super',
}

interface MenuItem {
    roles?: RoleEnum[];
    items?: MenuItem[];
}

export interface User {
    readonly id: number;
    readonly name: string;
    readonly email: string;
    readonly controlNumber: string;
    readonly ddr: string;
    readonly createdAt: Date;
    readonly isExpired: boolean;
    readonly roles: RoleEnum[];
    readonly managingCompany?: Company;
}

export enum AttendantTypeEnum {
    USER = 'USER',
    ASSISTANT = 'ASSISTANT',
}

export interface Attendant {
    readonly id?: number;
    readonly name: string;
    readonly attendantId: number;
    readonly attendantTypeEnum: AttendantTypeEnum;
}

export interface UpdateAttendant {
    readonly attendants: Attendant[];
}

export interface CompanyPhone {
    readonly id?: number;
    readonly phone: string;
    readonly attendants: Attendant[];
}

export interface Company {
    readonly id?: number;
    readonly name: string;
    readonly controlNumber: string;
    readonly phones: CompanyPhone[];
}

export interface Guideline {
    readonly id?: number;
    readonly controlNumber: number;
    readonly companyName: string;
    readonly activity: string;
    readonly actuationArea: string;
    readonly descriptionUrl: string;
    readonly description: string;
}

export interface Assistant {
    readonly id?: number;
    readonly userId: number;
    readonly name: string;
    readonly controlNumber: number;
    readonly objective: string;
    readonly descriptionUrls: string[];
}

export interface VoiceAssistant {
    readonly id?: number;
    readonly vapiAssistantId: string
    readonly name: string;
    readonly startSpeaking: boolean
    readonly firstMessage: string;
    readonly objective: string;
    readonly tools: string[];
}

export interface AssistantAnalysis {
    readonly uniqueId: string;
    readonly assistantId: number;
    readonly text: string;
    readonly name: string;
}

export enum WsEventEnum {
    CDR_NEW = 'CDR_NEW',
    CDR_ANALYSED = 'CDR_ANALYZED',
}

export enum PhoneStateEnum {
    INITIALIZING = 'Iniciando',
    CONNECTED = 'Conectado',
    DISCONNECTED = 'Desconectado',
    REGISTERED = 'Registrado',
    REGISTRATION_FAILED = 'Falha no Registro',
    CALLING = 'Chamando',
    INCOMING_CALL = 'Recebendo Chamada',
    TALKING = 'Conversando',
    AVAILABLE = 'Disponível'
}

export interface PhoneState {
    readonly state: PhoneStateEnum
    readonly session?: RTCSession;
}

export enum CallAnalyzeStatusEnum {
    ANALYZING = 'ANALYZING',
    FINISHED = 'FINISHED',
    FAILED = 'FAILED',
}

export interface CallAnalyze {
    readonly title: string;
    readonly temperature: TemperatureEnum;
    readonly engagement: number;
    readonly status: CallAnalyzeStatusEnum;
}

export interface CallAnalyzeEvent {
    readonly cdrId: number;
    readonly analyze: CallAnalyze;
}

export interface WsEvent {
    readonly type: WsEventEnum;
    readonly cdr?: Cdr;
    readonly callAnalyze?: CallAnalyzeEvent;
}

export interface Channel {
    workerId: string;
    action: string;
    channelId: string;
}

export interface Worker {
    id: number,
    name: string,
    isReady: boolean,
    maxChannels: number,
    channelMessages: Channel[],
}
