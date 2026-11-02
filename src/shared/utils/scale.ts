import { Note } from "tonal";

function getPitchClass(note: string): number | null {
  if (!/^[A-Ga-g](?:#{1,2}|b{1,2})?(?:-?\d+)?$/.test(note)) return null;
  return Note.chroma(note);
}

export function sortScaleStartingWithC(notes: string[]): string[] {
  return [...notes].sort(
    (first, second) =>
      (getPitchClass(first) ?? 12) - (getPitchClass(second) ?? 12),
  );
}
