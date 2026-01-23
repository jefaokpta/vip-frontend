import { Cdr, LanguageEnum } from '@/pabx/types';
import {TemperatureEnum} from "@/types/types";

export function sortCdrByDate(cdrs: Cdr[]) {
    return cdrs.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
}

export function getTemperatureSeverity(temperature: TemperatureEnum) {
    switch (temperature) {
        case 'QUENTE':
            return 'danger';
        case 'MORNA':
            return 'warn';
        case 'FRIA':
            return 'info';
        default:
            return 'info';
    }
}

export function formattedText(text: string): string {
    return text.replaceAll(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
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

