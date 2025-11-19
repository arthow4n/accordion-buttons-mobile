import * as Tone from 'tone';

export class AudioEngine {
    constructor() {
        // Initialize synth with accordion-like characteristics
        this.synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: {
                type: 'sawtooth'
            },
            envelope: {
                attack: 0.05,
                decay: 0.1,
                sustain: 0.3,
                release: 0.1
            }
        });

        // Filter to soften the sawtooth wave
        this.filter = new Tone.Filter(3000, "lowpass");
        
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

    play(note, frequency) {
        // We use the note (MIDI number) to get the note name (e.g. "C4")
        // This ensures consistency between play and stop, avoiding floating point issues with frequency
        const noteName = Tone.Frequency(note, "midi").toNote();
        
        // Trigger attack if not already playing (PolySynth handles multiple voices, 
        // but we want to avoid re-triggering the same note if it's held? 
        // Tone.PolySynth handles re-triggering by stealing or adding voices. 
        // Accordion.jsx handles logic to not call play if already active.
        this.synth.triggerAttack(noteName);
    }

    stop(note) {
        const noteName = Tone.Frequency(note, "midi").toNote();
        this.synth.triggerRelease(noteName);
    }

    setVolume(val) {
        // val is linear gain (0.0 to 0.5 based on current Accordion.jsx logic)
        // Tone.Gain.gain.value accepts linear values
        this.gain.gain.value = val;
    }
}

export const audio = new AudioEngine();
