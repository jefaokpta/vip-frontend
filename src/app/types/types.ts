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

export enum RoleEnum {
    FREE = 'free',
    USER = 'user',
    ADMIN = 'admin',
    SUPER = 'super',
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

export interface Worker {
    readonly id: number,
    readonly name: string,
    readonly isReady: boolean,
    readonly maxChannels: number,
    readonly channelIds: string[],
}


