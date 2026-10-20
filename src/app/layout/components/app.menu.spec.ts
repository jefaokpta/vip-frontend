import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenu } from '@/layout/components/app.menu';
import { UserService } from '@/pages/users/user.service';
import { RoleEnum } from '@/types/role-enum';
import { ModuleEnum } from '@/types/module-enum';

describe('AppMenu', () => {
    function buildMenu(roles: RoleEnum[], modules: ModuleEnum[]): MenuItem[] {
        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                {
                    provide: UserService,
                    useValue: { getUser: () => ({ roles }), hasModule: (m: ModuleEnum) => modules.includes(m) }
                }
            ]
        });
        const menu = TestBed.createComponent(AppMenu).componentInstance;
        menu.ngOnInit();
        return menu.filteredModel;
    }

    function labels(items: MenuItem[]): string[] {
        return items.flatMap((i) => [i.label!, ...labels(i.items ?? [])]);
    }

    const ADMIN = [RoleEnum.ROLE_COMPANY_ADMIN, RoleEnum.ROLE_COMPANY_SUPERVISOR, RoleEnum.ROLE_COMPANY_USER];
    const SUPERVISOR = [RoleEnum.ROLE_COMPANY_SUPERVISOR, RoleEnum.ROLE_COMPANY_USER];
    const USER = [RoleEnum.ROLE_COMPANY_USER];

    it('admin sem módulo PABX não vê o item PABX, mas vê Minhas Chamadas', () => {
        const all = labels(buildMenu(ADMIN, [ModuleEnum.VIDEO]));
        expect(all).not.toContain('PABX');
        expect(all).toContain('Minhas Chamadas');
    });

    it('admin com módulo PABX vê o item PABX', () => {
        expect(labels(buildMenu(ADMIN, [ModuleEnum.PABX]))).toContain('PABX');
    });

    it('usuário com PABX não vê Painel de Filas e vê Painel de Ramais', () => {
        const all = labels(buildMenu(USER, [ModuleEnum.PABX]));
        expect(all).not.toContain('Painel de Filas');
        expect(all).toContain('Painel de Ramais');
    });

    it('supervisor com PABX vê os dois painéis', () => {
        const all = labels(buildMenu(SUPERVISOR, [ModuleEnum.PABX]));
        expect(all).toContain('Painel de Filas');
        expect(all).toContain('Painel de Ramais');
    });

    it('sem PABX não vê nenhum dos painéis', () => {
        const all = labels(buildMenu(SUPERVISOR, []));
        expect(all).not.toContain('Painel de Filas');
        expect(all).not.toContain('Painel de Ramais');
    });

    it('descarta grupos que ficam sem itens', () => {
        const all = labels(buildMenu(USER, []));
        expect(all).not.toContain('Configurações');
    });

    it('usuário só com SAC vê SAC e não vê Vendas, Video Chamadas nem PABX', () => {
        const all = labels(buildMenu(USER, [ModuleEnum.SAC]));
        expect(all).toContain('SAC');
        expect(all).not.toContain('Vendas');
        expect(all).not.toContain('Video Chamadas');
        expect(all).not.toContain('PABX');
    });

    it('usuário sem módulos não vê o grupo SERVIÇOS', () => {
        expect(labels(buildMenu(USER, []))).not.toContain('SERVIÇOS');
    });
});
