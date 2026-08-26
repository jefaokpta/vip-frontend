import {RTCSession} from 'jssip/lib/RTCSession';
import {PhoneStateEnum} from '@/types/phone-state-enum';

export interface PhoneState {
    readonly state: PhoneStateEnum;
    readonly session?: RTCSession;
}
