import { actionArg3DefaultValue, actionArg3Validators } from '@/pabx/utils';
import { FormControl } from '@angular/forms';
import { DialPlanActionEnum } from '@/pabx/types/dial-plan-action-enum';

describe('actionArg3DefaultValue', () => {
    it('DIAL_PEER começa com tempo de toque de 30s', () => {
        expect(actionArg3DefaultValue(DialPlanActionEnum.DIAL_PEER)).toBe('30');
    });

    it('demais ações começam vazias', () => {
        expect(actionArg3DefaultValue(DialPlanActionEnum.HANGUP)).toBe('');
    });
});

describe('actionArg3Validators', () => {
    const validate = (action: DialPlanActionEnum, value: string) =>
        new FormControl(value, actionArg3Validators(action)).valid;

    it('DIAL_PEER aceita 5 a 300 e vazio (worker usa 30)', () => {
        expect(validate(DialPlanActionEnum.DIAL_PEER, '5')).toBeTrue();
        expect(validate(DialPlanActionEnum.DIAL_PEER, '300')).toBeTrue();
        expect(validate(DialPlanActionEnum.DIAL_PEER, '')).toBeTrue();
    });

    it('DIAL_PEER rejeita fora da faixa', () => {
        expect(validate(DialPlanActionEnum.DIAL_PEER, '4')).toBeFalse();
        expect(validate(DialPlanActionEnum.DIAL_PEER, '999')).toBeFalse();
    });

    it('outras ações não validam arg3', () => {
        expect(validate(DialPlanActionEnum.CALENDAR, '999')).toBeTrue();
    });
});
