import { actionArg3DefaultValue } from '@/pabx/utils';
import { DialPlanActionEnum } from '@/pabx/types/dial-plan-action-enum';

describe('actionArg3DefaultValue', () => {
    it('DIAL_PEER começa com tempo de toque de 30s', () => {
        expect(actionArg3DefaultValue(DialPlanActionEnum.DIAL_PEER)).toBe('30');
    });

    it('demais ações começam vazias', () => {
        expect(actionArg3DefaultValue(DialPlanActionEnum.HANGUP)).toBe('');
    });
});
