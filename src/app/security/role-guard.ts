import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '@/pages/users/user.service';
import { RoleEnum } from '@/types/role-enum';

/**
 * Guarda de rota que exige que o usuário tenha a role informada
 * Redireciona para a página inicial caso o usuário não tenha a role
 */
export const roleGuard = (role: RoleEnum): CanActivateFn => {
    return () => {
        const userService = inject(UserService);
        const router = inject(Router);
        return userService.getUser().roles.includes(role) ? true : router.createUrlTree(['/']);
    };
};
