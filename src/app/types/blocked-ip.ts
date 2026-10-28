export type BlockedIpOrigin = 'MANUAL' | 'AUTO';
export type BlockedIpStatus = 'BLOCKED' | 'ALLOWED';

export type BlockedIp = {
    id: number;
    ip: string;
    companyId: string | null;
    origin: BlockedIpOrigin;
    status: BlockedIpStatus;
    createdAt: string;
    updatedAt: string;
};
