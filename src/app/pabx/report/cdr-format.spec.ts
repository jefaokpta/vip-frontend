import {dispositionSeverity, dispositionTranslate, formatDate, formatDuration} from '@/pabx/report/cdr-format';

describe('cdr-format', () => {
    describe('formatDate', () => {
        it('formata data no padrão dd/mm/yyyy HH:mm:ss', () => {
            const date = new Date(2026, 7, 26, 9, 5, 3);
            expect(formatDate(date)).toBe('26/08/2026 09:05:03');
        });
    });

    describe('formatDuration', () => {
        it('formata segundos como HH:mm:ss', () => {
            expect(formatDuration(3725)).toBe('01:02:05');
        });

        it('formata zero segundos', () => {
            expect(formatDuration(0)).toBe('00:00:00');
        });
    });

    describe('dispositionSeverity', () => {
        it('retorna success para ANSWERED', () => {
            expect(dispositionSeverity('ANSWERED')).toBe('success');
        });

        it('retorna warn para BUSY', () => {
            expect(dispositionSeverity('BUSY')).toBe('warn');
        });

        it('retorna danger para NO ANSWER e FAILED', () => {
            expect(dispositionSeverity('NO ANSWER')).toBe('danger');
            expect(dispositionSeverity('FAILED')).toBe('danger');
        });

        it('retorna secondary para valores desconhecidos', () => {
            expect(dispositionSeverity('UNKNOWN')).toBe('secondary');
        });
    });

    describe('dispositionTranslate', () => {
        it('traduz os status conhecidos', () => {
            expect(dispositionTranslate('ANSWERED')).toBe('Atendida');
            expect(dispositionTranslate('BUSY')).toBe('Ocupada');
            expect(dispositionTranslate('NO ANSWER')).toBe('Não atendida');
            expect(dispositionTranslate('FAILED')).toBe('Falha');
        });

        it('retorna Desconhecido para status não mapeado', () => {
            expect(dispositionTranslate('XYZ')).toBe('Desconhecido');
        });
    });
});
