import { TrunkRow, withClearedTrunksAsZero } from '@/pabx/route/route-trunks';

type RouteForm = { name?: string; routeTrunks: (TrunkRow & { accountCode: string })[] };

describe('withClearedTrunksAsZero', () => {
    it('converte tronco desmarcado (null) em 0, que o backend entende como "sem tronco"', () => {
        const route: RouteForm = {
            name: 'Padrao',
            routeTrunks: [
                { accountCode: '2.00', trunk1: 1, trunk2: null, trunk3: undefined },
                { accountCode: '7.00', trunk1: null, trunk2: 0, trunk3: 3 }
            ]
        };

        expect(withClearedTrunksAsZero(route)).toEqual({
            name: 'Padrao',
            routeTrunks: [
                { accountCode: '2.00', trunk1: 1, trunk2: 0, trunk3: 0 },
                { accountCode: '7.00', trunk1: 0, trunk2: 0, trunk3: 3 }
            ]
        });
    });

    it('não altera o objeto original', () => {
        const route: RouteForm = { routeTrunks: [{ accountCode: '2.00', trunk1: null, trunk2: 0, trunk3: 0 }] };

        withClearedTrunksAsZero(route);

        expect(route.routeTrunks[0].trunk1).toBeNull();
    });
});
