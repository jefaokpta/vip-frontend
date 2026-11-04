import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {UserService} from '@/pages/users/user.service';
import {canManageUser} from '@/pages/users/utils';

/**
 * Guarda da rota de edição de usuário: só permite editar usuários do mesmo nível ou abaixo do logado
 * Redireciona para a lista de usuários caso contrário (ou se o usuário não puder ser carregado)
 */
export const manageUserGuard: CanActivateFn = (route) => {
    const userService = inject(UserService);
    const router = inject(Router);
    const usersList = router.createUrlTree(['/pages/users']);
    return userService
        .findById(route.paramMap.get('id')!)
        .then((target) => (canManageUser(userService.getUser().roles, target.roles) ? true : usersList))
        .catch(() => usersList);
};
