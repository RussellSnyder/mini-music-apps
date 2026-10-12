import { ChordType, Note, ScaleType } from "tonal";

export type Match = {
  name: string;
  root: string;
  type: string;
  notes: string[];
  intervals: string[];
  exact: boolean;
};

export type Possibilities = {
  notes: string[];
  chords: Match[];
  scales: Match[];
};

const ROOTS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const toMask = (chroma: string) => parseInt(chroma, 2);

// The leftmost bit is C, so moving up by `semitones` shifts bits right.
const rotate = (mask: number, semitones: number) =>
  ((mask >> semitones) | (mask << (12 - semitones))) & 0xfff;

export function parseNotes(input: string) {
  const tokens = input.split(/[\s,]+/).filter(Boolean);
  const valid: string[] = [];
  const invalid: string[] = [];
  for (const token of tokens) {
    (Note.get(token).empty ? invalid : valid).push(token);
  }
  return { valid, invalid };
}

function find(
  mask: number,
  firstChroma: number,
  types: {
    name: string;
    aliases?: string[];
    chroma: string;
    intervals: string[];
  }[],
  label: (root: string, type: { name: string; aliases?: string[] }) => string,
): Match[] {
  const matches: Match[] = [];
  for (const type of types) {
    const typeMask = toMask(type.chroma);
    ROOTS.forEach((root, semitones) => {
      // Type chroma is relative to C, so shift it to the root.
      const shifted = rotate(typeMask, semitones);
      if ((shifted & mask) !== mask) return;
      matches.push({
        name: label(root, type),
        root,
        type: type.name,
        notes: type.intervals.map((i) => Note.transpose(root, i)),
        intervals: type.intervals,
        exact: shifted === mask,
      });
    });
  }
  const rootFirst = (m: Match) => Number(Note.chroma(m.root) === firstChroma);
  return matches.sort(
    (a, b) =>
      Number(b.exact) - Number(a.exact) ||
      rootFirst(b) - rootFirst(a) ||
      a.notes.length - b.notes.length ||
      a.name.localeCompare(b.name),
  );
}

export function getPossibilities(notes: string[]): Possibilities {
  const mask = notes.reduce(
    (acc, note) => acc | (1 << (11 - (Note.chroma(note) as number))),
    0,
  );
  const firstChroma = Note.chroma(notes[0]) as number;
  if (!mask) return { notes, chords: [], scales: [] };

  return {
    notes,
    chords: find(mask, firstChroma, ChordType.all(), (root, type) => {
      const symbol = type.aliases?.[0] ?? "";
      return `${root}${symbol}`;
    }),
    scales: find(
      mask,
      firstChroma,
      ScaleType.all(),
      (root, type) => `${root} ${type.name}`,
    ),
  };
}
