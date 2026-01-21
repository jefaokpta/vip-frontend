import { RoleEnum } from '@/types/types';

export function translateRole(role: RoleEnum): string {
    switch (role) {
        case RoleEnum.ROLE_ADMIN:
            return 'Administrador';
        case RoleEnum.ROLE_USER:
            return 'Usuário';
        case RoleEnum.ROLE_SUPERVISOR:
            return 'Supervisor';
        case RoleEnum.ROLE_SUPPORT:
            return 'Suporte';
        case RoleEnum.ROLE_SUPER:
            return 'Super Usuário';
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
