export interface RegisterInstance {
    readonly id: number;
    readonly name: string;
    readonly dns: string;
    readonly internalIp: string;
}

export interface NewRegisterInstance {
    readonly name: string;
    readonly dns: string;
    readonly internalIp: string;
}
