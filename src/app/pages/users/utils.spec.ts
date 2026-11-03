import {buildModuleOptions, canManageUser} from '@/pages/users/utils';
import {ServiceEnum} from '@/types/service-enum';
import {ModuleEnum} from '@/types/module-enum';
import {RoleEnum} from '@/types/role-enum';

describe('buildModuleOptions', () => {
    it('retorna só os módulos dos serviços da empresa, excluindo IA', () => {
        const options = buildModuleOptions([ServiceEnum.PABX, ServiceEnum.IA, ServiceEnum.SAC]);
        expect(options.map((o) => o.value)).toEqual([ModuleEnum.PABX, ModuleEnum.SAC]);
    });

    it('retorna vazio quando a empresa só tem IA', () => {
        expect(buildModuleOptions([ServiceEnum.IA])).toEqual([]);
    });
});

describe('canManageUser', () => {
    it('permite gerenciar usuário do mesmo nível', () => {
        expect(canManageUser([RoleEnum.ROLE_COMPANY_SUPERVISOR], [RoleEnum.ROLE_COMPANY_SUPERVISOR])).toBeTrue();
    });

    it('permite gerenciar usuário de nível abaixo', () => {
        expect(canManageUser([RoleEnum.ROLE_COMPANY_SUPERVISOR], [RoleEnum.ROLE_COMPANY_USER])).toBeTrue();
    });

    it('não permite gerenciar usuário de nível acima', () => {
        expect(canManageUser([RoleEnum.ROLE_COMPANY_SUPERVISOR], [RoleEnum.ROLE_COMPANY_ADMIN])).toBeFalse();
    });

    it('considera o nível mais alto entre as roles cumulativas', () => {
        const tenantAdmin = [RoleEnum.ROLE_COMPANY_ADMIN, RoleEnum.ROLE_TENANT_ADMIN];
        expect(canManageUser([RoleEnum.ROLE_COMPANY_ADMIN], tenantAdmin)).toBeFalse();
        expect(canManageUser(tenantAdmin, [RoleEnum.ROLE_COMPANY_ADMIN])).toBeTrue();
    });
});
