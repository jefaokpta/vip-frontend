import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const DDR_MAX_DIGITS = 14;

export function onlyDigits(value: string): string {
    return (value ?? '').replace(/\D/g, '');
}

/**
 * Formatos aceitos (somente dígitos):
 * DDD+tel (10-11), OP+DDD+tel (12-13), 0+OP+DDD+tel (13-14) e 0800+7 dígitos (11).
 * Com 13 dígitos, começar com 0 indica 0+OP+DDD+tel8; caso contrário OP+DDD+tel9.
 */
export function isValidDdr(digits: string): boolean {
    return /^\d+$/.test(digits) && layout(digits) !== null;
}

export function formatDdr(ddr: string): string {
    const d = ddr ?? '';
    const parts = /^\d+$/.test(d) ? layout(d) : null;
    return parts ? parts : d;
}

function layout(d: string): string | null {
    const local = (n: string) => (n.length === 9 ? `${n.slice(0, 5)}-${n.slice(5)}` : `${n.slice(0, 4)}-${n.slice(4)}`);
    switch (d.length) {
        case 10:
            return `(${d.slice(0, 2)}) ${local(d.slice(2))}`;
        case 11:
            return d.startsWith('0800')
                ? `0800 ${d.slice(4, 7)} ${d.slice(7)}`
                : `(${d.slice(0, 2)}) ${local(d.slice(2))}`;
        case 12:
            return `${d.slice(0, 2)} (${d.slice(2, 4)}) ${local(d.slice(4))}`;
        case 13:
            return d.startsWith('0')
                ? `0 ${d.slice(1, 3)} (${d.slice(3, 5)}) ${local(d.slice(5))}`
                : `${d.slice(0, 2)} (${d.slice(2, 4)}) ${local(d.slice(4))}`;
        case 14:
            return d.startsWith('0') ? `0 ${d.slice(1, 3)} (${d.slice(3, 5)}) ${local(d.slice(5))}` : null;
        default:
            return null;
    }
}

export const ddrValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const digits = onlyDigits(control.value ?? '');
    if (!digits) return null; // required cuida do vazio
    return isValidDdr(digits) ? null : { ddrFormat: true };
};
