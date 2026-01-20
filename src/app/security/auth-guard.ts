import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { UserService } from '@/pages/users/user.service';

const LOGIN_ROUTE = '/auth/login';

/**
 * Guarda de rota para verificar se o usuário está autenticado
 * Redireciona para a página de login em caso de falha na autenticação
 */
export const authGuard: CanActivateFn = async (route, state): Promise<boolean | UrlTree> => {
    const userService = inject(UserService);
    const router = inject(Router);

    try {
        await userService.refreshToken();
        const user = userService.getUser();
        if (!user.isPasswordCreated) {
            router.navigate(['/auth/newpassword', { email: encodeURI(user.email) }]);
            return false;
        }
        return true;
    } catch (erro) {
        console.error('Falha na validação do token:', erro);
        return redirecionarParaLogin(router, state.url);
    }
};

/**
 * Redireciona o usuário para a página de login e preserva a URL de retorno
 * @param router Instância do Router para navegação
 * @param returnUrl URL para retornar após o login bem-sucedido
 * @returns UrlTree para navegação
 */
function redirecionarParaLogin(router: Router, returnUrl: string): UrlTree {
    return router.createUrlTree([LOGIN_ROUTE], {
        queryParams: { returnUrl }
    });
}
