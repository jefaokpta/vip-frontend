const RING_NOTES_HZ = [659.25, 830.61]; // Mi5 e Sol#5: intervalo de terça maior, soa como um carrilhão
const NOTE_SPACING_S = 0.2;
const NOTE_DURATION_S = 0.9;
const RING_PERIOD_S = 3;
const RING_VOLUME = 0.2;
const NOTE_ATTACK_S = 0.015;
const SILENCE = 0.0001; // rampa exponencial não aceita chegar a zero
const SCHEDULED_SECONDS = 600;

/**
 * Toque de chamada recebida gerado no navegador: duas notas suaves com decaimento, a cada 3 segundos.
 */
export class IncomingRingTone {
    private context: AudioContext | null = null;

    start() {
        if (this.context) return;
        this.context = new AudioContext();
        const now = this.context.currentTime;
        // agenda toques por até 10 minutos; stop() encerra antes
        for (let t = 0; t < SCHEDULED_SECONDS; t += RING_PERIOD_S) {
            RING_NOTES_HZ.forEach((frequency, index) => {
                this.scheduleNote(this.context!, frequency, now + t + index * NOTE_SPACING_S);
            });
        }
    }

    stop() {
        this.context?.close();
        this.context = null;
    }

    private scheduleNote(context: AudioContext, frequency: number, start: number) {
        const gain = context.createGain();
        gain.connect(context.destination);
        gain.gain.setValueAtTime(SILENCE, start);
        gain.gain.linearRampToValueAtTime(RING_VOLUME, start + NOTE_ATTACK_S);
        gain.gain.exponentialRampToValueAtTime(SILENCE, start + NOTE_DURATION_S);

        const oscillator = context.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        oscillator.connect(gain);
        oscillator.start(start);
        oscillator.stop(start + NOTE_DURATION_S);
    }
}
