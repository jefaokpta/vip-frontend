import {TestBed} from '@angular/core/testing';
import {
    ActivatedRouteSnapshot,
    convertToParamMap,
    provideRouter,
    Router,
    RouterStateSnapshot,
    UrlTree
} from '@angular/router';
import {manageUserGuard} from '@/security/manage-user-guard';
import {UserService} from '@/pages/users/user.service';
import {RoleEnum} from '@/types/role-enum';

describe('manageUserGuard', () => {
    function runGuard(loggedRoles: RoleEnum[], findById: () => Promise<unknown>) {
        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                { provide: UserService, useValue: { getUser: () => ({ roles: loggedRoles }), findById } }
            ]
        });
        const route = { paramMap: convertToParamMap({ id: '7' }) } as ActivatedRouteSnapshot;
        return TestBed.runInInjectionContext(() => manageUserGuard(route, {} as RouterStateSnapshot)) as Promise<boolean | UrlTree>;
    }

    function serialize(result: boolean | UrlTree) {
        return TestBed.inject(Router).serializeUrl(result as UrlTree);
    }

    it('permite editar usuário do mesmo nível', async () => {
        const result = await runGuard([RoleEnum.ROLE_COMPANY_SUPERVISOR], () =>
            Promise.resolve({ roles: [RoleEnum.ROLE_COMPANY_SUPERVISOR] })
        );
        expect(result).toBeTrue();
    });

    it('redireciona para a lista quando o usuário alvo é de nível acima', async () => {
        const result = await runGuard([RoleEnum.ROLE_COMPANY_SUPERVISOR], () =>
            Promise.resolve({ roles: [RoleEnum.ROLE_COMPANY_ADMIN] })
        );
        expect(serialize(result)).toBe('/pages/users');
    });

    it('redireciona para a lista quando não consegue carregar o usuário', async () => {
        const result = await runGuard([RoleEnum.ROLE_COMPANY_ADMIN], () => Promise.reject(new Error('404')));
        expect(serialize(result)).toBe('/pages/users');
    });
});
