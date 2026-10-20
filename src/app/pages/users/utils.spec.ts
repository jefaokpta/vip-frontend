import {buildModuleOptions} from '@/pages/users/utils';
import {ServiceEnum} from '@/types/service-enum';
import {ModuleEnum} from '@/types/module-enum';

describe('buildModuleOptions', () => {
    it('retorna só os módulos dos serviços da empresa, excluindo IA', () => {
        const options = buildModuleOptions([ServiceEnum.PABX, ServiceEnum.IA, ServiceEnum.SAC]);
        expect(options.map((o) => o.value)).toEqual([ModuleEnum.PABX, ModuleEnum.SAC]);
    });

    it('retorna vazio quando a empresa só tem IA', () => {
        expect(buildModuleOptions([ServiceEnum.IA])).toEqual([]);
    });
});
