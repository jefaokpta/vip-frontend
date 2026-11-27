import {Cdr} from '@/pabx/types/cdr';
import {DialPlanActionEnum} from '@/pabx/types/dial-plan-action-enum';
import {DtmfModeEnum} from '@/pabx/types/dtmf-mode-enum';
import {LanguageEnum} from '@/pabx/types/language-enum';
import {ValidatorFn, Validators} from '@angular/forms';

export function sortCdrByDate(cdrs: Cdr[]) {
    return cdrs.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
}

export function languageSelectOptions(): { value: string; label: string }[] {
    const languageTranslation = [
        { label: 'Português', value: LanguageEnum.pt_BR },
        { label: 'Inglês', value: LanguageEnum.en },
        { label: 'Espanhol', value: LanguageEnum.es },
        { label: 'Francês', value: LanguageEnum.fr }
    ];
    return Object.values(LanguageEnum).map((value) => ({
        value,
        label: languageTranslation.find((lang) => lang.value === value)?.label ?? value
    }));
}

export function dtmfSelectOptions(): { value: string; label: string }[] {
    return Object.values(DtmfModeEnum).map((value) => ({ value, label: value }));
}

export function actionArg2HasDefaultValue(selectedAction: DialPlanActionEnum): string {
    if (selectedAction === DialPlanActionEnum.DIAL_PEER) return 't';
    return '';
}

export const DEFAULT_DIAL_PEER_TIMEOUT = '30';

/** arg3 da ação DIAL_PEER guarda o tempo de toque do ramal, em segundos. */
export function actionArg3DefaultValue(selectedAction: DialPlanActionEnum): string {
    if (selectedAction === DialPlanActionEnum.DIAL_PEER) return DEFAULT_DIAL_PEER_TIMEOUT;
    return '';
}

/** DIAL_PEER: tempo de toque entre 5 e 300s; vazio é aceito (o worker usa 30). */
export function actionArg3Validators(selectedAction: DialPlanActionEnum): ValidatorFn[] {
    if (selectedAction === DialPlanActionEnum.DIAL_PEER) return [Validators.min(5), Validators.max(300)];
    return [];
}

export function actionHasArg1(selectedAction: DialPlanActionEnum): Validators[] {
    if (selectedAction === DialPlanActionEnum.ANSWER || selectedAction === DialPlanActionEnum.HANGUP) return [];
    if (selectedAction === DialPlanActionEnum.CALENDAR_EXTERNAL_CALL) return [Validators.required, Validators.pattern(/^\d+$/)];
    return [Validators.required];
}

const ALPHANUMERIC_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/** Mesmo formato do backend (generateAlphanumericSecret): 16 caracteres alfanuméricos. */
export function generateAlphanumericSecret(length = 16): string {
    const limit = 256 - (256 % ALPHANUMERIC_CHARS.length);
    let secret = '';
    while (secret.length < length) {
        const [byte] = crypto.getRandomValues(new Uint8Array(1));
        if (byte < limit) secret += ALPHANUMERIC_CHARS[byte % ALPHANUMERIC_CHARS.length];
    }
    return secret;
}
