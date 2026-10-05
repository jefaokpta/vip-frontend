export interface WorkerInstance {
    readonly id: number;
    readonly name: string;
    readonly dns: string | null;
    readonly internalIp: string | null;
    readonly active: boolean;
}

export interface NewWorkerInstance {
    readonly name: string;
    readonly dns: string;
    readonly internalIp: string;
    readonly active: boolean;
}
