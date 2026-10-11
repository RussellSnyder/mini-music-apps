export type ScientificNote = {
  note: string;
  octave: number | null;
};

// Splits a scientific pitch name into note and octave: "F#-1" -> { note: "F#", octave: -1 }.
// Strings without a trailing octave number return the input as the note and a null octave.
export function parseScientificNote(input: string): ScientificNote {
  const value = input.trim();
  const match = value.match(/^([A-Ga-g][#b]*)(-?\d+)$/);
  if (!match) return { note: value, octave: null };
  return { note: match[1], octave: Number(match[2]) };
}
