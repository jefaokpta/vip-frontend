/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 29/07/2025
 */

export function handleCalleId(callerId?: string) {
    if (callerId === '*12345') return 'Teste Assistente';
    return callerId;
}
