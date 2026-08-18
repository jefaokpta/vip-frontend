export interface Tenant {
    readonly id: number;
    readonly name: string;
    readonly primaryCompanyId: number;
}

export interface NewTenant {
    readonly name: string;
    readonly primaryCompanyId: number;
}
