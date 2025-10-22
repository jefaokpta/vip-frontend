/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 5/9/25
 */

import { Cdr, TemperatureEnum } from '@/types/types';

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
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

export function telephoneFormat(tel?: string): string {
    if (!tel) return '';
    const match = RegExp(/^(\d{2})(\d{4,5})(\d{4})$/).exec(tel);
    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return tel;
}
