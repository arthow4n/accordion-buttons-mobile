// C-System layout logic
// Rows are vertical columns.
// Row 0 is the first row (Outer).
// Notes increase by minor thirds (3 semitones) as you go down the column.
// Adjacent rows are shifted by semitones.

const BASE_NOTE = 48; // C3

export const generateLayout = (numRows = 5, numCols = 13, startOctave = 3, accidentalType = 'sharp') => {
    const buttons = [];

    // Row definitions (offsets from C)
    // Row 0: 0 (C)
    // Row 1: 1 (C#)
    // Row 2: 2 (D)
    // Row 3: 0 (C) - Duplicate
    // Row 4: 1 (C#) - Duplicate
    const rowNoteOffsets = [0, 1, 2, 0, 1];

    // We generate columns (which are the "rows" of the accordion)
    // Let's call them "boardRows" to avoid confusion with the vertical "cols" of buttons.
    // Actually, let's stick to:
    // r = index of the vertical column (0..4)
    // c = index of the button in the column (0..12)

    for (let r = 0; r < numRows; r++) {
        const noteOffset = rowNoteOffsets[r];

        for (let c = 0; c < numCols; c++) {
            // Note calculation
            // Base + (vertical index * 3) + row offset
            let note = BASE_NOTE + (c * 3) + noteOffset;

            // Adjust octave
            note += (startOctave - 3) * 12;

            buttons.push({
                id: `r${r}-c${c}`,
                boardRow: r, // Vertical column index
                boardCol: c, // Vertical position index
                note: note,
                label: getNoteLabel(note, accidentalType),
                isBlack: isBlackKey(note),
                frequency: midiToFreq(note)
            });
        }
    }
    return buttons;
};

const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const getNoteLabel = (midi, type = 'sharp') => {
    const noteIndex = midi % 12;
    const octave = Math.floor(midi / 12) - 1;
    const notes = type === 'flat' ? NOTES_FLAT : NOTES_SHARP;
    return `${notes[noteIndex]}${octave}`;
};

const isBlackKey = (midi) => {
    // Standard piano black keys: C#, Eb, F#, Ab, Bb
    // Indices: 1, 3, 6, 8, 10
    const noteIndex = midi % 12;
    return [1, 3, 6, 8, 10].includes(noteIndex);
};

const midiToFreq = (midi) => {
    return 440 * Math.pow(2, (midi - 69) / 12);
};
