// Audio Engine
// Pure Synthesizer implementation

const midiToFreq = (midi) => {
    return 440 * Math.pow(2, (midi - 69) / 12);
};

export class AudioEngine {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.activeNodes = {}; // Map note -> { source, gain }
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.5;
        this.masterGain.connect(this.ctx.destination);
    }

    async init() {
        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
    }

    play(note, frequency) {
        if (this.activeNodes[note]) {
            return;
        }
        this.playSynth(note, frequency);
    }

    stop(note) {
        if (this.activeNodes[note]) {
            const { source, gain } = this.activeNodes[note];

            // Release envelope
            const now = this.ctx.currentTime;
            gain.gain.cancelScheduledValues(now);
            gain.gain.setValueAtTime(gain.gain.value, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.1); // Short release

            source.stop(now + 0.1);

            delete this.activeNodes[note];
        }
    }

    playSynth(note, frequency) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Accordion-like sound: Sawtooth or Square with some filtering
        osc.type = 'sawtooth';
        osc.frequency.value = frequency;

        // Filter to soften the sawtooth
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 3000;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        const now = this.ctx.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.5, now + 0.05); // Attack

        osc.start(now);

        this.activeNodes[note] = { source: osc, gain: gain };
    }

    setVolume(val) {
        this.masterGain.gain.value = val;
    }
}

export const audio = new AudioEngine();
