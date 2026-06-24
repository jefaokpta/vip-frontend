import { Company } from '@/types/company';
import { RoleEnum } from '@/types/role-enum';

export interface User {
    readonly id: number;
    readonly name: string;
    readonly email: string;
    readonly sub: string;
    readonly companyId: string;
    readonly isConfirmed: boolean;
    readonly isPasswordCreated: boolean;
    readonly createdAt: Date;
    readonly isExpired: boolean;
    readonly roles: RoleEnum[];
    readonly managingCompany?: Company;
}
