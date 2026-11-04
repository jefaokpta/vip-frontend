import {DtmfKeyTone} from './dtmf-key-tone';

describe('DtmfKeyTone', () => {
    let oscillators: any[];
    let contextConstructor: jasmine.Spy;

    beforeEach(() => {
        oscillators = [];
        const context = {
            currentTime: 2,
            destination: {},
            createOscillator: () => {
                const oscillator = {
                    frequency: { value: 0 },
                    connect: () => {},
                    start: jasmine.createSpy('start'),
                    stop: jasmine.createSpy('stop')
                };
                oscillators.push(oscillator);
                return oscillator;
            },
            createGain: () => ({
                gain: { setValueAtTime: () => {}, linearRampToValueAtTime: () => {} },
                connect: () => {}
            })
        };
        contextConstructor = spyOn(window as any, 'AudioContext').and.returnValue(context);
    });

    const cases: [string, number, number][] = [
        ['1', 697, 1209],
        ['5', 770, 1336],
        ['9', 852, 1477],
        ['*', 941, 1209],
        ['0', 941, 1336],
        ['#', 941, 1477]
    ];

    cases.forEach(([digit, low, high]) => {
        it(`usa as frequências padrão do dígito ${digit}`, () => {
            new DtmfKeyTone().play(digit);
            expect(oscillators.map((oscillator) => oscillator.frequency.value)).toEqual([low, high]);
        });
    });

    it('toca um som curto', () => {
        new DtmfKeyTone().play('1');
        expect(oscillators[0].start).toHaveBeenCalledOnceWith(2);
        expect(oscillators[0].stop).toHaveBeenCalledOnceWith(2.15);
    });

    it('reaproveita o mesmo contexto de áudio entre dígitos', () => {
        const tone = new DtmfKeyTone();
        tone.play('1');
        tone.play('2');
        expect(contextConstructor).toHaveBeenCalledTimes(1);
    });

    it('ignora o que não é dígito de telefone', () => {
        new DtmfKeyTone().play('a');
        expect(oscillators.length).toBe(0);
    });
});
