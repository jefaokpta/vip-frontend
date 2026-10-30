/**
 * Tom de chamada (ringback) padrão brasileiro gerado no navegador: 425 Hz, 1s ligado / 4s desligado.
 */
export class RingbackTone {
    private context: AudioContext | null = null;
    private oscillator: OscillatorNode | null = null;

    start() {
        if (this.context) return;
        this.context = new AudioContext();
        const gain = this.context.createGain();
        gain.connect(this.context.destination);

        this.oscillator = this.context.createOscillator();
        this.oscillator.frequency.value = 425;
        this.oscillator.connect(gain);

        const now = this.context.currentTime;
        gain.gain.setValueAtTime(0, now);
        // agenda cadências por até 10 minutos; stop() encerra antes
        for (let t = 0; t < 600; t += 5) {
            gain.gain.setValueAtTime(0.15, now + t);
            gain.gain.setValueAtTime(0, now + t + 1);
        }
        this.oscillator.start(now);
    }

    stop() {
        this.oscillator?.stop();
        this.context?.close();
        this.oscillator = null;
        this.context = null;
    }
}
