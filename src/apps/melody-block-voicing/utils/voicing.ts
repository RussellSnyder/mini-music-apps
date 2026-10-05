import { Note, Scale } from "tonal";
import { convertMidiNumberToABC } from "../../../shared/utils/noteConverstion";

export type NonScaleToneResolution =
  | "repeat-last-note"
  | "diminished"
  | "chromatic";

// Moves each MIDI note down by a number of scale steps. A note outside the
// scale counts the first scale tone below it as step one.
export function transposeDownByScaleSteps(
  midiNotes: number[],
  steps: number,
  root: string,
  scaleName: string,
  nonScaleToneResolution: NonScaleToneResolution,
): number[] {
  const chromas = new Set(
    Scale.get(`${root} ${scaleName}`)
      .notes.map((n) => Note.chroma(n))
      .filter((c): c is number => c !== undefined),
  );
  if (chromas.size === 0) return midiNotes;

  return midiNotes.map((midi, i) => {
    let note = midi;
    let remaining = steps;

    const isNonChord = !chromas.has(((note % 12) + 12) % 12);

    if (isNonChord && nonScaleToneResolution === "chromatic") {
      const lastMidiNote = midiNotes[i - 1];
    }

    while (remaining > 0 && note > 0) {
      note -= 1;
      if (chromas.has(((note % 12) + 12) % 12)) remaining -= 1;
    }
    return note;
  });
}

const PITCH_CLASSES: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

const isFieldLine = (line: string) => /^\s*[A-Za-z]:/.test(line);

// Header fields worth carrying over; the key is dropped because pitches are
// always written with explicit accidentals
function splitAbc(abc: string) {
  const lines = abc.split(/\r?\n/);
  const header = lines
    .filter((line) => /^\s*[XTMLQ]:/.test(line))
    .map((line) => line.trim());
  // Blank lines would end the tune in ABC
  const body = lines.filter((line) => line.trim() && !isFieldLine(line));
  return { header, body };
}

// Quoted text, decorations and inline fields are matched first so their
// letters aren't mistaken for notes
const TOKEN =
  /("[^"]*"|![^!]*!|\[[A-Za-z]:[^\]]*\])|(\|)|(\^{1,2}|_{1,2}|=)?([A-Ga-g])([,']*)/g;

// Use more tonal.js functions for note manipulation if needed
function transposeAbcLine(
  line: string,
  shift: (midi: number) => number,
  altered: Set<string>,
): string {
  return line.replace(
    TOKEN,
    (
      match,
      passthrough?: string,
      bar?: string,
      accidental = "",
      letter?: string,
      octaveMarks = "",
    ) => {
      if (passthrough) return match;
      if (bar) {
        altered.clear();
        return match;
      }
      const offset = accidental.startsWith("^")
        ? accidental.length
        : accidental.startsWith("_")
          ? -accidental.length
          : 0;
      const marks = [...octaveMarks].reduce(
        (sum, mark) => sum + (mark === "'" ? 12 : -12),
        0,
      );
      const midi =
        ((letter as string) === (letter as string).toLowerCase() ? 72 : 60) +
        PITCH_CLASSES[(letter as string).toUpperCase()] +
        marks +
        offset;

      const abcNote = convertMidiNumberToABC(shift(midi), "");
      const abcMatch = abcNote.match(/^([_^=]*)([A-Ga-g])/);
      const abcLetter = abcMatch?.[2].toUpperCase() ?? "";
      if (abcMatch?.[1] && abcMatch[1] !== "=") {
        altered.add(abcLetter);
        return abcNote;
      }
      if (altered.has(abcLetter)) return `=${abcNote}`;
      return abcNote;
    },
  );
}

function transposeBody(
  body: string[],
  steps: number,
  root: string,
  scaleName: string,
  nonScaleToneResolution: NonScaleToneResolution,
): string[] {
  const altered = new Set<string>();
  return body.map((line) =>
    transposeAbcLine(
      line,
      (midi) =>
        transposeDownByScaleSteps(
          [midi],
          steps,
          root,
          scaleName,
          nonScaleToneResolution,
        )[0],
      altered,
    ),
  );
}

// Same rhythm, bars and rests as the input, with every pitch moved down
export function transposeAbcDownByScaleSteps(
  abc: string,
  steps: number,
  root: string,
  scaleName: string,
  nonScaleToneResolution: NonScaleToneResolution,
): string {
  const { header, body } = splitAbc(abc);
  return [
    ...header,
    ...transposeBody(body, steps, root, scaleName, nonScaleToneResolution),
  ].join("\n");
}

// The melody plus each voice as separate ABC voices, so they render and play together
export function buildVoicesAbc(
  melodyAbc: string,
  stepsBelow: number[],
  root: string,
  scaleName: string,
  nonScaleToneResolution: NonScaleToneResolution,
): string {
  const { header, body } = splitAbc(melodyAbc);
  if (!body.some((line) => line.trim())) return "";

  const ids = [0, ...stepsBelow].map((_, i) => i + 1);
  const voices = [0, ...stepsBelow].map(
    (steps, i) =>
      `V:${i + 1}\n${transposeBody(body, steps, root, scaleName, nonScaleToneResolution).join("\n")}`,
  );
  return [...header, `%%score ${ids.join(" ")}`, ...voices].join("\n");
}
