import * as Tone from 'tone';

export class AudioEngine {
    constructor() {
        this.presets = {
            // Single Reed Registers
            clarinet: { // 8'
                oscillator: { type: 'sawtooth' },
                envelope: { attack: 0.05, decay: 0.1, sustain: 0.7, release: 0.1 },
                filterFreq: 3000,
                filterType: 'lowpass',
                octaves: [0]
            },
            bassoon: { // 16'
                oscillator: { type: 'sawtooth' },
                envelope: { attack: 0.05, decay: 0.1, sustain: 0.7, release: 0.1 },
                filterFreq: 2000,
                filterType: 'lowpass',
                octaves: [-12]
            },
            piccolo: { // 4'
                oscillator: { type: 'sawtooth' },
                envelope: { attack: 0.05, decay: 0.1, sustain: 0.7, release: 0.1 },
                filterFreq: 4000,
                filterType: 'lowpass',
                octaves: [12]
            },

            // Dual Reed Registers
            violin: { // 8' + 8' (detuned)
                oscillator: { type: 'fatsawtooth', count: 2, spread: 15 },
                envelope: { attack: 0.05, decay: 0.1, sustain: 0.7, release: 0.1 },
                filterFreq: 3500,
                filterType: 'lowpass',
                octaves: [0]
            },
            celeste: { // 8' + 8' (Swing - mild detune)
                oscillator: { type: 'fatsawtooth', count: 2, spread: 10 },
                envelope: { attack: 0.05, decay: 0.1, sustain: 0.7, release: 0.1 },
                filterFreq: 3500,
                filterType: 'lowpass',
                octaves: [0]
            },
            bandoneon: { // 16' + 8'
                oscillator: { type: 'sawtooth' },
                envelope: { attack: 0.05, decay: 0.1, sustain: 0.7, release: 0.1 },
                filterFreq: 2500,
                filterType: 'lowpass',
                octaves: [-12, 0]
            },
            oboe: { // 8' + 4'
                oscillator: { type: 'sawtooth' },
                envelope: { attack: 0.05, decay: 0.1, sustain: 0.7, release: 0.1 },
                filterFreq: 3500,
                filterType: 'lowpass',
                octaves: [0, 12]
            },
            organ: { // 16' + 4'
                oscillator: { type: 'sawtooth' },
                envelope: { attack: 0.05, decay: 0.1, sustain: 0.7, release: 0.1 },
                filterFreq: 3000,
                filterType: 'lowpass',
                octaves: [-12, 12]
            },

            // Triple/Quad Reed Registers
            harmonium: { // LMM (16' + 8' + 8' detuned)
                oscillator: { type: 'fatsawtooth', count: 2, spread: 15 },
                envelope: { attack: 0.05, decay: 0.1, sustain: 0.7, release: 0.1 },
                filterFreq: 3000,
                filterType: 'lowpass',
                octaves: [-12, 0]
            },
            master: { // LMM (Dry) or LMH - Let's keep previous "Master" as LMH (16+8+4 dry)
                oscillator: { type: 'sawtooth' },
                envelope: { attack: 0.05, decay: 0.1, sustain: 0.7, release: 0.1 },
                filterFreq: 3000,
                filterType: 'lowpass',
                octaves: [-12, 0, 12]
            },
            full_master: { // LMMH (16' + 8' + 8' + 4')
                oscillator: { type: 'fatsawtooth', count: 2, spread: 15 },
                envelope: { attack: 0.05, decay: 0.1, sustain: 0.7, release: 0.1 },
                filterFreq: 3500,
                filterType: 'lowpass',
                octaves: [-12, 0, 12]
            },
            musette: { // 8' + 8' + 8' (detuned)
                oscillator: { type: 'fatsawtooth', count: 3, spread: 30 },
                envelope: { attack: 0.05, decay: 0.1, sustain: 0.7, release: 0.1 },
                filterFreq: 4000,
                filterType: 'lowpass',
                octaves: [0]
            },

            // Legacy/Default
            accordion: { // Default balanced sound (similar to Violin or Master but simpler)
                oscillator: { type: 'sawtooth' },
                envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 0.1 },
                filterFreq: 3000,
                filterType: 'lowpass',
                octaves: [0]
            }
        };

        this.currentPreset = this.presets.accordion;

        // Initialize synth with default (accordion)
        this.synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: this.currentPreset.oscillator,
            envelope: this.currentPreset.envelope
        });

        // Filter
        this.filter = new Tone.Filter(this.currentPreset.filterFreq, this.currentPreset.filterType);

        // Master gain for volume control
        this.gain = new Tone.Gain(0.5);

        // Chain: Synth -> Filter -> Gain -> Destination
        this.synth.connect(this.filter);
        this.filter.connect(this.gain);
        this.gain.toDestination();
    }

    async init() {
        await Tone.start();
    }

    setPreset(presetName) {
        // Release all currently playing notes to avoid stuck notes when switching
        this.synth.releaseAll();

        const preset = this.presets[presetName] || this.presets.accordion;
        this.currentPreset = preset;

        // Update Synth
        this.synth.set({
            oscillator: preset.oscillator,
            envelope: preset.envelope
        });

        // Update Filter
        this.filter.frequency.value = preset.filterFreq;
        this.filter.type = preset.filterType;
    }

    play(note) {
        // Play all octaves defined in the preset
        const octaves = this.currentPreset.octaves || [0];
        octaves.forEach(offset => {
            const noteName = Tone.Frequency(note + offset, "midi").toNote();
            this.synth.triggerAttack(noteName);
        });
    }

    stop(note) {
        // Stop all octaves defined in the preset
        const octaves = this.currentPreset.octaves || [0];
        octaves.forEach(offset => {
            const noteName = Tone.Frequency(note + offset, "midi").toNote();
            this.synth.triggerRelease(noteName);
        });
    }

    setVolume(val) {
        // val is linear gain (0.0 to 0.5 based on current Accordion.jsx logic)
        // Tone.Gain.gain.value accepts linear values
        this.gain.gain.value = val;
    }
}

export const audio = new AudioEngine();
