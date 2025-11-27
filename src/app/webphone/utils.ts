/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 29/07/2025
 */

export function handleCalleId(callerId?: string) {
    if (callerId === '*12345') return 'Teste Assistente';
    return callerId;
}

export function telephoneFormat(tel?: string): string {
    if (!tel) return '';
    const match = new RegExp(/^(\d{2})(\d{4,5})(\d{4})$/).exec(tel);
    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return tel;
}
