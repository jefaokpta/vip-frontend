const BEEP_FREQUENCY_HZ = 480;
const BEEP_DURATION_S = 0.3;
const BEEP_VOLUME = 0.15;
const BEEP_FADE_S = 0.01;

/**
 * Beep de fim de chamada gerado no navegador. As rampas de volume evitam estalos no início e no fim do som.
 */
export class EndCallBeep {
    play() {
        const context = new AudioContext();
        const gain = context.createGain();
        gain.connect(context.destination);

        const oscillator = context.createOscillator();
        oscillator.frequency.value = BEEP_FREQUENCY_HZ;
        oscillator.connect(gain);
        oscillator.onended = () => context.close();

        const start = context.currentTime;
        const end = start + BEEP_DURATION_S;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(BEEP_VOLUME, start + BEEP_FADE_S);
        gain.gain.setValueAtTime(BEEP_VOLUME, end - BEEP_FADE_S);
        gain.gain.linearRampToValueAtTime(0, end);

        oscillator.start(start);
        oscillator.stop(end);
    }
}
