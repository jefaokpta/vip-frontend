export interface NewPeerBatch {
    readonly startRange: number;
    readonly endRange: number;
    readonly pickUpGroup: string | null;
}
