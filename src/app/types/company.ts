export interface Company {
    readonly id: number;
    readonly name: string;
    readonly corporateName: string;
    readonly companyId: string;
    readonly cnpj: string;
    readonly tenantId: number;
}

export interface NewCompany {
    readonly name: string;
    readonly corporateName: string;
    readonly cnpj: string;
}
