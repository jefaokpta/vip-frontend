export enum CallHistoryType {
    OUTGOING = 'OUTGOING',
    INCOMING = 'INCOMING',
    MISSED = 'MISSED'
}

export interface CallHistory {
    telephone: string;
    type: CallHistoryType;
    time: string;
}
