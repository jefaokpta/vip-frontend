import {TestBed} from '@angular/core/testing';
import {TrunkSelectComponent} from './trunk-select-component';
import {TrunkService} from '@/pabx/trunk/trunk.service';
import {UserService} from '@/pages/users/user.service';
import {RoleEnum} from '@/types/role-enum';

describe('TrunkSelectComponent', () => {
    const trunks = [
        { id: 5, name: 'SBC Vivo' },
        { id: 6, name: 'SBC Claro' }
    ];

    async function create(roles: RoleEnum[], value?: string) {
        TestBed.configureTestingModule({
            imports: [TrunkSelectComponent],
            providers: [
                { provide: TrunkService, useValue: { findOptions: () => Promise.resolve(trunks) } },
                { provide: UserService, useValue: { getUser: () => ({ roles }) } }
            ]
        });
        const component = TestBed.createComponent(TrunkSelectComponent).componentInstance;
        component.isShowAnyTrunkLabel = true;
        if (value) component.writeValue(value);
        component.ngOnInit();
        await new Promise((resolve) => setTimeout(resolve));
        return component;
    }

    it('suporte SaaS ve TODOS e todos os troncos', async () => {
        const component = await create([RoleEnum.ROLE_SAAS_SUPPORT, RoleEnum.ROLE_COMPANY_ADMIN]);
        expect(component.trunkOptions.map((o) => o.label)).toEqual(['TODOS', 'SBC Vivo', 'SBC Claro']);
    });

    it('company-admin e tenant-admin veem apenas TODOS', async () => {
        const component = await create([RoleEnum.ROLE_TENANT_ADMIN, RoleEnum.ROLE_COMPANY_ADMIN]);
        expect(component.trunkOptions).toEqual([{ label: 'TODOS', value: 'ANY' }]);
    });

    it('ao editar regra com tronco definido pelo suporte, mantem so ele alem de TODOS', async () => {
        const component = await create([RoleEnum.ROLE_COMPANY_ADMIN], '6');
        expect(component.trunkOptions.map((o) => o.label)).toEqual(['TODOS', 'SBC Claro']);
    });
});
