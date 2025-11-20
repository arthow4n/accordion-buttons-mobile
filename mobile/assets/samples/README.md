# Accordion Samples

To use real accordion samples:

1. Obtain WAV files for the notes you want to support.
2. Rename them to `note_{midi}.wav`.
   - Example: Middle C is `note_60.wav`.
   - C#4 is `note_61.wav`.
3. Place them in this directory.

The app will automatically detect if `note_60.wav` exists and switch to sample mode.
If a specific note sample is missing in sample mode, it will fallback to the synthesizer for that note.
