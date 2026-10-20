import { ServiceEnum } from '@/types/service-enum';

export interface Company {
    readonly id: number;
    readonly name: string;
    readonly corporateName: string;
    readonly companyId: string;
    readonly cnpj: string;
    readonly tenantId: number;
    readonly services?: ServiceEnum[];
}

export interface NewCompany {
    readonly name: string;
    readonly corporateName: string;
    readonly cnpj: string;
}
