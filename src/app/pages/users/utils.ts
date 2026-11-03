import {RoleEnum} from '@/types/role-enum';
import {ServiceEnum} from '@/types/service-enum';
import {ModuleEnum} from '@/types/module-enum';

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

export function translateModule(module: ModuleEnum): string {
    switch (module) {
        case ModuleEnum.PABX:
            return 'PABX';
        case ModuleEnum.VIDEO:
            return 'Vídeo';
        case ModuleEnum.VENDAS:
            return 'Vendas';
        case ModuleEnum.SAC:
            return 'SAC';
        default:
            return module;
    }
}

export function buildModuleOptions(companyServices: ServiceEnum[]) {
    return Object.values(ModuleEnum)
        .filter((module) => companyServices.includes(module as unknown as ServiceEnum))
        .map((module) => ({
            label: translateModule(module),
            value: module
        }));
}

// RoleEnum está declarado em ordem crescente de hierarquia, então o índice serve como nível
function roleLevel(roles: RoleEnum[]): number {
    const levels = Object.values(RoleEnum);
    return Math.max(-1, ...roles.map((role) => levels.indexOf(role)));
}

export function canManageUser(loggedRoles: RoleEnum[], targetRoles: RoleEnum[]): boolean {
    return roleLevel(targetRoles) <= roleLevel(loggedRoles);
}
