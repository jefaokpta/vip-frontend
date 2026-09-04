import { abandonedPercent, answeredPercent, eventLabel, eventSeverity, formatHms, percentSeverity } from '@/pabx/dac-report/dac-report.utils';

describe('dac-report.utils', () => {
    describe('formatHms', () => {
        it('formata segundos como HH:mm:ss', () => {
            expect(formatHms(3725)).toBe('01:02:05');
        });

        it('formata zero segundos', () => {
            expect(formatHms(0)).toBe('00:00:00');
        });
    });

    describe('percentSeverity', () => {
        it('retorna success para >= 70', () => {
            expect(percentSeverity(70)).toBe('success');
            expect(percentSeverity(100)).toBe('success');
        });

        it('retorna info para >= 30 e < 70', () => {
            expect(percentSeverity(30)).toBe('info');
            expect(percentSeverity(69)).toBe('info');
        });

        it('retorna warn para < 30', () => {
            expect(percentSeverity(0)).toBe('warn');
            expect(percentSeverity(29)).toBe('warn');
        });
    });

    describe('answeredPercent', () => {
        it('calcula o percentual de atendidas sobre o total', () => {
            expect(answeredPercent({ totalCalls: 4, answeredCalls: 3 })).toBe(75);
        });

        it('retorna 0 quando totalCalls e zero', () => {
            expect(answeredPercent({ totalCalls: 0, answeredCalls: 0 })).toBe(0);
        });
    });

    describe('abandonedPercent', () => {
        it('calcula o percentual de abandonadas sobre o total', () => {
            expect(abandonedPercent({ totalCalls: 4, abandonedCalls: 1 })).toBe(25);
        });

        it('retorna 0 quando totalCalls e zero', () => {
            expect(abandonedPercent({ totalCalls: 0, abandonedCalls: 0 })).toBe(0);
        });
    });

    describe('eventLabel', () => {
        it('traduz os 7 eventos da jornada', () => {
            expect(eventLabel('CALL_ENTRY')).toBe('Entrou na fila');
            expect(eventLabel('CALLING_MEMBER')).toBe('Chamando membro');
            expect(eventLabel('CALLING_MEMBER_FAILED')).toBe('Membro não atendeu');
            expect(eventLabel('CALL_ANSWERED')).toBe('Atendida pelo membro');
            expect(eventLabel('CALL_ABANDON')).toBe('Abandonada pelo cliente');
            expect(eventLabel('MEMBER_HANGUP')).toBe('Encerrada pelo membro');
            expect(eventLabel('CALLER_HANGUP')).toBe('Encerrada pelo cliente');
        });
    });

    describe('eventSeverity', () => {
        it('retorna success para CALL_ANSWERED', () => {
            expect(eventSeverity('CALL_ANSWERED')).toBe('success');
        });

        it('retorna info para CALLING_MEMBER', () => {
            expect(eventSeverity('CALLING_MEMBER')).toBe('info');
        });

        it('retorna warn para CALLING_MEMBER_FAILED e CALL_ABANDON', () => {
            expect(eventSeverity('CALLING_MEMBER_FAILED')).toBe('warn');
            expect(eventSeverity('CALL_ABANDON')).toBe('warn');
        });

        it('retorna secondary para os demais eventos', () => {
            expect(eventSeverity('CALL_ENTRY')).toBe('secondary');
            expect(eventSeverity('MEMBER_HANGUP')).toBe('secondary');
            expect(eventSeverity('CALLER_HANGUP')).toBe('secondary');
        });
    });
});
