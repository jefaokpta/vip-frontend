
export enum DealStatusEnum {
    OPEN = 'open',
    ALL_NOT_DELETED = 'all_not_deleted',
}

export interface Pipedrive {
    readonly id: number;
    readonly url: string;
    readonly token: string;
    readonly controlNumber: string;
    readonly dealStatus: DealStatusEnum;
    readonly isActive: boolean;
}
