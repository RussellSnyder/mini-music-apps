import { AbcNotation, Note } from "tonal";
import type { Match } from "./possibilities";

const toAbc = (note: string) => AbcNotation.scientificToAbcNotation(note);

// ABC accidentals last until the end of the bar, so a natural that follows
// an altered note of the same letter and octave needs an explicit "=".
function withNaturals(notes: string[]) {
  const altered = new Set<string>();
  return notes.map((note) => {
    const { letter, acc, oct } = Note.get(note);
    const key = `${letter}${oct}`;
    if (acc) {
      altered.add(key);
      return toAbc(note);
    }
    return altered.has(key) ? `=${toAbc(note)}` : toAbc(note);
  });
}

const tune = (body: string) => `X:1\nL:1/4\nK:C\n${body}|]`;

const byPitch = (notes: string[]) =>
  [...notes].sort((a, b) => (Note.midi(a) ?? 0) - (Note.midi(b) ?? 0));

// Places pitch classes in ascending order starting from the root at octave 4.
export function ascending(root: string, intervals: string[]) {
  return byPitch(intervals.map((i) => Note.transpose(`${root}4`, i)));
}

export function inputToAbc(notes: string[]) {
  const withOctave = notes.map((n) => {
    const { oct } = Note.get(n);
    return oct === undefined ? `${n}4` : n;
  });
  return withNaturals(withOctave).join(" ");
}

export function scaleAbc(match: Match) {
  const up = ascending(match.root, match.intervals);
  const octave = Note.transpose(`${match.root}4`, "8P");
  return tune(withNaturals([...up, octave]).join(" "));
}

export function chordAbc(match: Match) {
  const notes = ascending(match.root, match.intervals);
  const arpeggio = withNaturals(notes).join(" ");
  const block = `[${notes.map(toAbc).join("")}]2`;
  return tune(`${arpeggio} ${block}`);
}
