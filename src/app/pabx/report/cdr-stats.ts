/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 */

import {Cdr} from '@/pabx/types/cdr';

export function avgDurationSeconds(cdrs: Cdr[]): number {
    if (!cdrs.length) return 0;
    return Math.round(cdrs.reduce((sum, c) => sum + c.billableSeconds, 0) / cdrs.length);
}

export function answerRate(cdrs: Cdr[]): number {
    if (!cdrs.length) return 0;
    const answered = cdrs.filter((c) => c.disposition === 'ANSWERED').length;
    return Math.round((answered / cdrs.length) * 1000) / 10;
}

export function totalTalkSeconds(cdrs: Cdr[]): number {
    return cdrs.reduce((sum, c) => sum + c.billableSeconds, 0);
}
