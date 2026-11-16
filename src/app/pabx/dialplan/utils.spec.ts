import {matchesDialplanSearch} from '@/pabx/dialplan/utils';
import {DialPlan} from '@/pabx/types/dial-plan';

describe('matchesDialplanSearch', () => {
    const aliases = new Map([['7', 'Comercial SP']]);
    const byExpression = { name: 'Saída celular', dst: '_9XXXXXXXX' } as DialPlan;
    const byAlias = { name: 'Entrada', dstAlias: 7 } as DialPlan;

    it('texto vazio mostra todas', () => {
        expect(matchesDialplanSearch(byAlias, '  ', aliases)).toBeTrue();
    });

    it('casa pelo nome, sem diferenciar maiúsculas', () => {
        expect(matchesDialplanSearch(byExpression, 'CELULAR', aliases)).toBeTrue();
    });

    it('casa pelo destino em expressão', () => {
        expect(matchesDialplanSearch(byExpression, '_9xx', aliases)).toBeTrue();
    });

    it('casa pelo nome do alias de destino', () => {
        expect(matchesDialplanSearch(byAlias, 'comercial', aliases)).toBeTrue();
    });

    it('não casa pelo id do alias quando o nome é conhecido', () => {
        expect(matchesDialplanSearch(byAlias, '7', aliases)).toBeFalse();
    });

    it('não casa quando nada bate', () => {
        expect(matchesDialplanSearch(byAlias, 'financeiro', aliases)).toBeFalse();
    });
});
