import { Note } from "@tonaljs/tonal";

export function noteNameToMidi(noteName: string): number | null {
  const midiValue = Note.midi(noteName.trim());

  return midiValue ?? null;
}

export function noteNamesToMidi(noteNames: string[]): number[] {
  return noteNames
    .map(noteNameToMidi)
    .filter((midiValue): midiValue is number => midiValue !== null);
}

export function noteNameToAbc(noteName: string): string | null {
  const match = noteName.trim().match(/^([A-Ga-g])([#b]?)(-?\d+)$/);

  if (!match) {
    return null;
  }

  const [, noteLetter, accidental, octaveValue] = match;
  const octave = Number(octaveValue);
  const abcAccidental =
    accidental === "#" ? "^" : accidental === "b" ? "_" : "";
  const isLowercase = octave >= 5;
  const abcLetter = isLowercase
    ? noteLetter.toLowerCase()
    : noteLetter.toUpperCase();
  const octaveMarks = isLowercase
    ? "'".repeat(octave - 5)
    : ",".repeat(4 - octave);

  return `${abcAccidental}${abcLetter}${octaveMarks}`;
}
