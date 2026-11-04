export type TranscriptionStatus = 'PENDING' | 'PROCESSING' | 'RETRY' | 'DONE' | 'FAILED';

export interface TranscriptionSummary {
    readonly id: number;
    readonly cdrUniqueId: string;
    readonly recordName: string;
    readonly status: TranscriptionStatus;
    readonly callStartTime: string;
    readonly src: string;
    readonly destination: string;
    readonly peer: string;
    readonly disposition: string;
    readonly callDuration: number;
    readonly audioSeconds: number | null;
    readonly attempts: number;
    readonly lastError: string | null;
}

export interface TranscriptionUtterance {
    readonly speaker: number;
    readonly startSeconds: number;
    readonly endSeconds: number;
    readonly content: string;
    readonly confidence: number | null;
}

export interface Transcription {
    readonly summary: TranscriptionSummary;
    readonly transcript: string | null;
    readonly language: string | null;
    readonly model: string | null;
    readonly utterances: TranscriptionUtterance[];
}
