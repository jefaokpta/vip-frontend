export interface WorkerInstance {
    readonly id: number;
    readonly name: string;
    readonly dns: string;
    readonly internalIp: string;
}

export interface NewWorkerInstance {
    readonly name: string;
    readonly dns: string;
    readonly internalIp: string;
}
