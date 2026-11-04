import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '@/pages/users/user.service';
import { ModuleEnum } from '@/types/module-enum';

/**
 * Guarda de rota que exige que o usuário tenha o módulo informado
 * Redireciona para a página inicial caso o usuário não tenha acesso ao módulo
 */
export const moduleGuard = (module: ModuleEnum): CanActivateFn => {
    return () => {
        const userService = inject(UserService);
        const router = inject(Router);
        return userService.hasModule(module) ? true : router.createUrlTree(['/']);
    };
};
