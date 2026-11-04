import {transferPickListItems} from '@/util/utils';

describe('transferPickListItems', () => {
    const a = {id: 1};
    const b = {id: 2};
    const c = {id: 3};

    it('move itens da origem para o fim do destino com novas referências', () => {
        const from = [a, b];
        const to = [c];
        const [newFrom, newTo] = transferPickListItems([a], from, to);
        expect(newFrom).toEqual([b]);
        expect(newTo).toEqual([c, a]);
        expect(newFrom).not.toBe(from);
        expect(newTo).not.toBe(to);
    });

    it('não duplica quando o PickList já mutou os arrays (botões)', () => {
        const [newFrom, newTo] = transferPickListItems([a], [b], [c, a]);
        expect(newFrom).toEqual([b]);
        expect(newTo).toEqual([c, a]);
    });
});
