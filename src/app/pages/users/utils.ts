import {RoleEnum} from '@/types/role-enum';

export function translateRole(role: RoleEnum): string {
    switch (role) {
        case RoleEnum.ROLE_SAAS_SUPPORT:
            return 'Suporte SaaS';
        case RoleEnum.ROLE_SAAS_FINANCE:
            return 'Financeiro SaaS';
        case RoleEnum.ROLE_SAAS_ADMIN:
            return 'Administrador SaaS';
        case RoleEnum.ROLE_TENANT_SUPPORT:
            return 'Suporte do Tenant';
        case RoleEnum.ROLE_TENANT_FINANCE:
            return 'Financeiro do Tenant';
        case RoleEnum.ROLE_TENANT_ADMIN:
            return 'Administrador do Tenant';
        case RoleEnum.ROLE_COMPANY_USER:
            return 'Usuário';
        case RoleEnum.ROLE_COMPANY_SUPERVISOR:
            return 'Supervisor';
        case RoleEnum.ROLE_COMPANY_ADMIN:
            return 'Administrador';
        default:
            return role;
    }
}

export function buildRoleOptions(userRoles: RoleEnum[]) {
    return Object.values(RoleEnum)
        .filter((role) => userRoles.includes(role))
        .map((role) => ({
            label: translateRole(role),
            value: role
        }));
}
