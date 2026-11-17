import {uraOptionLabel} from '@/pabx/ura-report/ura-option';
import {Ura} from '@/pabx/types/ura';
import {UraActionEnum} from '@/pabx/types/ura-action-enum';

describe('uraOptionLabel', () => {
    const ura = {
        invalidAction: { option: -2, uraActionEnum: UraActionEnum.RETURN_TO_START },
        timeoutAction: { option: -1, uraActionEnum: UraActionEnum.RETURN_TO_START },
        actions: [
            { option: 1, uraActionEnum: UraActionEnum.QUEUE, target: '5', description: 'Exames Laboratoriais' },
            { option: 2, uraActionEnum: UraActionEnum.HANGUP },
            { option: 3, uraActionEnum: UraActionEnum.HANGUP, description: '   ' }
        ]
    } as unknown as Ura;

    it('mostra "dígito - descrição" quando a opção tem descrição', () => {
        expect(uraOptionLabel(1, ura)).toBe('1 - Exames Laboratoriais');
    });

    it('mostra só o dígito quando não há descrição', () => {
        expect(uraOptionLabel(2, ura)).toBe('2');
        expect(uraOptionLabel(3, ura)).toBe('3');
    });

    it('mostra só o dígito quando a opção não existe mais na URA', () => {
        expect(uraOptionLabel(7, ura)).toBe('7');
    });

    it('nomeia opção inválida e tempo esgotado', () => {
        expect(uraOptionLabel(-2, ura)).toBe('Opção inválida');
        expect(uraOptionLabel(-1, ura)).toBe('Tempo esgotado');
    });
});
