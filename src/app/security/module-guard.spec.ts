import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { moduleGuard } from '@/security/module-guard';
import { UserService } from '@/pages/users/user.service';
import { ModuleEnum } from '@/types/module-enum';

describe('moduleGuard', () => {
    function runGuard(modules: ModuleEnum[]) {
        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                { provide: UserService, useValue: { hasModule: (m: ModuleEnum) => modules.includes(m) } }
            ]
        });
        return TestBed.runInInjectionContext(() =>
            moduleGuard(ModuleEnum.PABX)({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
        );
    }

    it('redireciona para / quando o usuário não tem o módulo PABX', () => {
        const result = runGuard([ModuleEnum.VIDEO]);
        expect(result instanceof UrlTree).toBeTrue();
        expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/');
    });

    it('permite quando o usuário tem o módulo PABX', () => {
        expect(runGuard([ModuleEnum.PABX])).toBeTrue();
    });
});
