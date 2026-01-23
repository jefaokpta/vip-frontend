import { Cdr, DtmfModeEnum, LanguageEnum } from '@/pabx/types';

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
