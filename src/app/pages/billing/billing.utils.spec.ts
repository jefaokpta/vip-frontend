import { inclusivePeriodEnd } from '@/pages/billing/billing.utils';

describe('inclusivePeriodEnd', () => {
    it('subtrai um dia do fim exclusivo', () => {
        const d = inclusivePeriodEnd('2026-11-26T00:00:00');
        expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 10, 25]);
    });

    it('vira o mês quando o fim é dia 1', () => {
        const d = inclusivePeriodEnd('2026-03-01');
        expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 1, 28]);
    });
});
