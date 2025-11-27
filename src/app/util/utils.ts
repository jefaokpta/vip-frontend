/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 5/9/25
 */

import {firstValueFrom, Observable, timeout} from "rxjs";

/**
 * Executa uma requisição HTTP com timeout e retorna a primeira resposta como Promise
 * @param request Observable da requisição HTTP
 * @param requestTimeout
 * @returns Promise com resultado da requisição
 */
export function executeRequest<T>(request: Observable<T>, requestTimeout: number = 5_000): Promise<T> {
    return firstValueFrom(request.pipe(timeout(requestTimeout)));
}

export function httpHeaders() {
    const bearer = 'Bearer ';
    return {
        headers: {
            Authorization: bearer + localStorage.getItem('token')
        }
    };
}
