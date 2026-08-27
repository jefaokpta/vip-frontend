export interface QueueOption {
    id: number;
    name: string;
}

export interface MemberActivitySession {
    start: number;
    end: number | null;
}

export interface MemberActivityPause {
    pauseId: number | null;
    pauseName: string | null;
    start: number;
    end: number | null;
    durationSeconds: number;
}

export interface MemberActivity {
    memberId: number;
    memberName: string;
    entrada: number;
    saida: number | null;
    loggedSeconds: number;
    pauseSeconds: number;
    productivityPercent: number;
    sessions: MemberActivitySession[];
    pauses: MemberActivityPause[];
}

export interface MemberActivityReportResponse {
    queueId: number;
    members: MemberActivity[];
}
