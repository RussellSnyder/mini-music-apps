import { Midi, AbcNotation } from "tonal";

// accidental (^ ^^ _ __ =), letter, octave marks (' or ,), optional length (2, /2, 3/2, /)
const ABC_NOTE = /^(\^{1,2}|_{1,2}|=)?[A-Ga-g](?:'+|,+)?(?:\d+)?(?:\/\d*)?$/;

// True for a single ABC note such as "C", "_C", "^f'", "G,2" or "A3/2".
// Scientific pitch names like "C#4" are not ABC notation.
export function isAbcNote(value: string): boolean {
  return ABC_NOTE.test(value.trim());
}

// True when every whitespace-separated token is an ABC note
export function isAbcNotes(value: string): boolean {
  const tokens = value.trim().split(/\s+/);
  return tokens.length > 0 && tokens[0] !== "" && tokens.every(isAbcNote);
}

export type AbcNoteParts = {
  note: string;
  rhythm: string;
};

// Splits an ABC note into pitch and rhythm: "_C,3/2" -> { note: "_C,", rhythm: "3/2" }.
// Returns null when the value is not an ABC note.
export function splitAbcNoteAndRhythm(value: string): AbcNoteParts | null {
  const trimmed = value.trim();
  if (!isAbcNote(trimmed)) return null;
  const match = trimmed.match(/^(.*?)(\d*\/?\d*)$/)!;
  return { note: match[1], rhythm: match[2] };
}

const LETTER_SEMITONES: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

export function abcNoteToMidi(value: string): number | null {
  const abcNoteAndRhythm = splitAbcNoteAndRhythm(value);
  const note = abcNoteAndRhythm?.note ?? "";
  if (!note) return null;

  const scientificNote = AbcNotation.abcToScientificNotation(note);
  
  const midi = Midi.toMidi(scientificNote);
  return midi;
}

// Negative if a is lower than b, positive if higher, 0 if the same pitch.
// Throws if either value is not an ABC note.
export function compareAbcNotes(a: string, b: string): number {
  const midiA = abcNoteToMidi(a);
  const midiB = abcNoteToMidi(b);
  if (midiA === null || midiB === null) {
    throw new Error(`Not an ABC note: ${midiA === null ? a : b}`);
  }
  return midiA - midiB;
}

export const isAbcNoteHigher = (a: string, b: string) =>
  compareAbcNotes(a, b) > 0;

export const isAbcNoteLower = (a: string, b: string) =>
  compareAbcNotes(a, b) < 0;
