import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { roleGuard } from '@/security/role-guard';
import { UserService } from '@/pages/users/user.service';
import { RoleEnum } from '@/types/role-enum';

describe('roleGuard', () => {
    function runGuard(roles: RoleEnum[]) {
        TestBed.configureTestingModule({
            providers: [provideRouter([]), { provide: UserService, useValue: { getUser: () => ({ roles }) } }]
        });
        return TestBed.runInInjectionContext(() =>
            roleGuard(RoleEnum.ROLE_COMPANY_SUPERVISOR)({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
        );
    }

    it('redireciona para / quando o usuário não tem a role', () => {
        const result = runGuard([RoleEnum.ROLE_COMPANY_USER]);
        expect(result instanceof UrlTree).toBeTrue();
        expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/');
    });

    it('permite quando o usuário tem a role', () => {
        expect(runGuard([RoleEnum.ROLE_COMPANY_SUPERVISOR])).toBeTrue();
    });
});
