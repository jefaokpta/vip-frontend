import {Cdr} from '@/pabx/types/cdr';
import {DialPlanActionEnum} from '@/pabx/types/dial-plan-action-enum';
import {DtmfModeEnum} from '@/pabx/types/dtmf-mode-enum';
import {LanguageEnum} from '@/pabx/types/language-enum';
import {Validators} from '@angular/forms';

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

export function actionHasArg1(selectedAction: DialPlanActionEnum): Validators[] {
    if (selectedAction === DialPlanActionEnum.ANSWER || selectedAction === DialPlanActionEnum.HANGUP) return [];
    return [Validators.required];
}

const ALPHANUMERIC_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/** Mesmo formato do backend (generateAlphanumericSecret): 8 caracteres alfanuméricos. */
export function generateAlphanumericSecret(length = 8): string {
    const limit = 256 - (256 % ALPHANUMERIC_CHARS.length);
    let secret = '';
    while (secret.length < length) {
        const [byte] = crypto.getRandomValues(new Uint8Array(1));
        if (byte < limit) secret += ALPHANUMERIC_CHARS[byte % ALPHANUMERIC_CHARS.length];
    }
    return secret;
}
