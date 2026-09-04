export type QueueJourneyEvent =
    | 'CALL_ENTRY'
    | 'CALLING_MEMBER'
    | 'CALLING_MEMBER_FAILED'
    | 'CALL_ANSWERED'
    | 'CALL_ABANDON'
    | 'MEMBER_HANGUP'
    | 'CALLER_HANGUP';

export type CallStatus = 'ANSWERED' | 'ABANDONED';

export interface CallJourneyEvent {
    eventType: QueueJourneyEvent;
    timestamp: number;
    offsetSeconds: number;
    memberPeer: string | null;
}

export interface CallJourney {
    uniqueId: string;
    entryTs: number;
    callerPeer: string | null;
    status: CallStatus;
    answeredByPeer: string | null;
    hasRecording: boolean;
    events: CallJourneyEvent[];
}

export interface DacCallsResponse {
    queueId: number;
    periodStart: number;
    periodEnd: number;
    serviceLevelSeconds: number;
    totalCalls: number;
    answeredCalls: number;
    abandonedCalls: number;
    avgWaitSeconds: number;
    avgTalkSeconds: number;
    serviceLevelPercent: number;
    calls: CallJourney[];
}

export interface RecordingUrlResponse {
    url: string;
}
