const LOW_HZ = [697, 770, 852, 941];
const HIGH_HZ = [1209, 1336, 1477];
const KEYPAD = ['123', '456', '789', '*0#'];
const TONE_DURATION_S = 0.15;
const TONE_VOLUME = 0.08;
const TONE_FADE_S = 0.005;

/**
 * Retorno sonoro local das teclas: o par de frequências DTMF padrão, gerado no navegador.
 * O contexto é reaproveitado porque o navegador limita quantos podem existir ao mesmo tempo.
 */
export class DtmfKeyTone {
    private context: AudioContext | null = null;

    play(digit: string) {
        const row = KEYPAD.findIndex((keys) => keys.includes(digit));
        if (digit.length !== 1 || row < 0) return;
        this.context ??= new AudioContext();
        const context = this.context;

        const start = context.currentTime;
        const end = start + TONE_DURATION_S;
        const gain = context.createGain();
        gain.connect(context.destination);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(TONE_VOLUME, start + TONE_FADE_S);
        gain.gain.setValueAtTime(TONE_VOLUME, end - TONE_FADE_S);
        gain.gain.linearRampToValueAtTime(0, end);

        [LOW_HZ[row], HIGH_HZ[KEYPAD[row].indexOf(digit)]].forEach((frequency) => {
            const oscillator = context.createOscillator();
            oscillator.frequency.value = frequency;
            oscillator.connect(gain);
            oscillator.start(start);
            oscillator.stop(end);
        });
    }
}
