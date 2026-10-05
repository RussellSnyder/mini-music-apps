import { at } from "lodash";

export function generatePattern(
  midiNotes: string | number[],
  midiOffsetOrPattern: number | string = 0,
  patternStr: string = "",
): number[][] {
  const midiOffset =
    typeof midiOffsetOrPattern === "number" ? midiOffsetOrPattern : 0;
  const actualPatternStr =
    typeof midiOffsetOrPattern === "string" ? midiOffsetOrPattern : patternStr;

  const patternArray = actualPatternStr
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map(Number)
    .filter((n) => !isNaN(n));

  // Convert midiNotes string or array into number array
  const parsedMidiNotes = (
    typeof midiNotes === "string"
      ? midiNotes
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
          .map(Number)
      : midiNotes
  )
    .filter((n) => !isNaN(n))
    .map((num) => num + midiOffset);

  if (patternArray.length === 0 || parsedMidiNotes.length === 0) {
    return [];
  }

  // Create an array of all rotations of the pattern
  const midiNoteRotations: number[][] = [];
  const largestPatternLeap = Math.max(...patternArray);
  for (let i = 0; i < parsedMidiNotes.length - largestPatternLeap + 1; i++) {
    midiNoteRotations.push(rotateArray(parsedMidiNotes, i));
  }

  const indexesToInclude = patternArray.map((elem) => elem - 1);

  return midiNoteRotations.map((rotation) => at(rotation, indexesToInclude));
}

function rotateArray<T>(arr: T[], rotateBy: number) {
  const n = arr.length;
  rotateBy %= n;

  return arr.slice(rotateBy).concat(arr.slice(0, rotateBy));
}
