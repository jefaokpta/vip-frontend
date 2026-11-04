import {IncomingRingTone} from './incoming-ring-tone';

describe('IncomingRingTone', () => {
    let oscillators: any[];
    let context: any;
    let contextConstructor: jasmine.Spy;

    beforeEach(() => {
        oscillators = [];
        context = {
            currentTime: 0,
            destination: {},
            createOscillator: () => {
                const oscillator = {
                    type: '',
                    frequency: { value: 0 },
                    connect: () => {},
                    start: jasmine.createSpy('start'),
                    stop: jasmine.createSpy('stop')
                };
                oscillators.push(oscillator);
                return oscillator;
            },
            createGain: () => ({
                gain: {
                    setValueAtTime: () => {},
                    linearRampToValueAtTime: () => {},
                    exponentialRampToValueAtTime: () => {}
                },
                connect: () => {}
            }),
            close: jasmine.createSpy('close')
        };
        contextConstructor = spyOn(window as any, 'AudioContext').and.returnValue(context);
    });

    it('toca duas notas suaves por toque, repetindo a cada 3 segundos', () => {
        new IncomingRingTone().start();
        const [first, second, nextRingFirst] = oscillators;
        expect(first.type).toBe('sine');
        expect(second.frequency.value).not.toBe(first.frequency.value);
        expect(second.start.calls.mostRecent().args[0]).toBeGreaterThan(first.start.calls.mostRecent().args[0]);
        expect(nextRingFirst.start).toHaveBeenCalledOnceWith(3);
    });

    it('não sobrepõe toques ao iniciar duas vezes', () => {
        const tone = new IncomingRingTone();
        tone.start();
        tone.start();
        expect(contextConstructor).toHaveBeenCalledTimes(1);
    });

    it('silencia imediatamente ao parar', () => {
        const tone = new IncomingRingTone();
        tone.start();
        tone.stop();
        expect(context.close).toHaveBeenCalledTimes(1);
    });

    it('parar sem ter iniciado não faz nada', () => {
        expect(() => new IncomingRingTone().stop()).not.toThrow();
    });
});
