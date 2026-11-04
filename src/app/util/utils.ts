/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 5/9/25
 */

import {firstValueFrom, Observable, timeout} from 'rxjs';

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

/**
 * Codifica um email em base64 para uso em query params (ofuscação simples, não criptografia)
 */
export function encodeEmailBase64(email: string): string {
    return btoa(email);
}

export function decodeEmailBase64(value: string): string {
    return atob(value);
}

/**
 * Mascara um email para exibição, ex.: "joao.silva@hotmail.com" -> "jo***@ho***.com"
 */
export function maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return email;
    const domainParts = domain.split('.');
    const domainName = domainParts.shift() ?? '';
    const domainSuffix = domainParts.length ? '.' + domainParts.join('.') : '';
    const maskedLocal = localPart.slice(0, 2) + '***';
    const maskedDomain = domainName.slice(0, 2) + '***';
    return `${maskedLocal}@${maskedDomain}${domainSuffix}`;
}

/**
 * Move itens entre os lados de um PickList, devolvendo novos arrays [origem, destino].
 * O PickList muta os arrays nos botões e só a lista filtrada do listbox no drag & drop;
 * como o listbox só refaz o filtro com nova referência, os dois lados são reconstruídos a partir dos itens movidos.
 */
export function transferPickListItems<T extends { id: number }>(items: T[], from: T[], to: T[]): [T[], T[]] {
    const ids = new Set(items.map((item) => item.id));
    return [from.filter((item) => !ids.has(item.id)), [...to.filter((item) => !ids.has(item.id)), ...items]];
}
