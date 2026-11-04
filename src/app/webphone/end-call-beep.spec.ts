import {EndCallBeep} from './end-call-beep';

describe('EndCallBeep', () => {
    let oscillator: any;
    let context: any;

    beforeEach(() => {
        oscillator = {
            frequency: { value: 0 },
            connect: jasmine.createSpy('connect'),
            start: jasmine.createSpy('start'),
            stop: jasmine.createSpy('stop'),
            onended: null
        };
        context = {
            currentTime: 10,
            destination: {},
            createOscillator: () => oscillator,
            createGain: () => ({
                gain: {
                    setValueAtTime: () => {},
                    linearRampToValueAtTime: () => {}
                },
                connect: () => {}
            }),
            close: jasmine.createSpy('close')
        };
        spyOn(window as any, 'AudioContext').and.returnValue(context);
    });

    it('toca um beep curto', () => {
        new EndCallBeep().play();
        expect(oscillator.start).toHaveBeenCalledOnceWith(10);
        expect(oscillator.stop).toHaveBeenCalledOnceWith(10.3);
    });

    it('libera o áudio do navegador quando o beep termina', () => {
        new EndCallBeep().play();
        expect(context.close).not.toHaveBeenCalled();
        oscillator.onended();
        expect(context.close).toHaveBeenCalledTimes(1);
    });
});
