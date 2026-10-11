import { AbcNotation, Note } from "tonal";
import {
  abcNoteToMidi,
  isAbcNote,
  splitAbcNoteAndRhythm,
} from "../../../shared/utils/abcNotation";
import { convertMidiNumberToABC } from "../../../shared/utils/noteConverstion";

const TODO_PLACEHOLDER = "TODO_PLACEHOLDER";

export type NonScaleToneResolution = "repeat-last-note" | "chromatic-approach";

// Moves each MIDI note down by a number of scale steps. A note outside the
// scale counts the first scale tone below it as step one.
export function transposeDownByScaleSteps(
  midiNotes: number[],
  steps: number,
  scaleNotes: string,
  nonScaleTonePlaceholder: string = "TODO",
): number[] {
  const chromas = new Set(
    scaleNotes
      .split(/[\s,]+/)
      .filter(Boolean)
      .map((n) => Note.chroma(n))
      .filter((c): c is number => c !== undefined),
  );
  if (chromas.size === 0) return midiNotes;

  return midiNotes.map((midi, i) => {
    let note = midi;
    let remaining = steps;

    const isNonChord = !chromas.has(((note % 12) + 12) % 12);

    if (isNonChord) {
      note = [nonScaleTonePlaceholder];
      return note;
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
  scaleNotes: string,
  nonScaleToneResolution: NonScaleToneResolution,
): string[] {
  const altered = new Set<string>();

  const scaleNotesArray = scaleNotes.split(" ");
  const scaleOverAllOctaves = Array.from({ length: 10 }, (_, octave) =>
    scaleNotesArray.map((note) => `${note}${octave}`),
  ).flat();
  // todo handle invalid input

  const lines = body.map((line) => line.split("|"));
  const linesWithMeasures = lines.map((line) =>
    line.map((measure) => measure.split(" ")),
  );
  console.log({ linesWithMeasures });
  // if the note entered isn't a scale note, we leave a placeholder for now
  const transposedMeasuresWithPlaceholders = linesWithMeasures.map((measure) =>
    measure.map((notes) =>
      notes.map((noteOrChar) => {
        if (isAbcNote(noteOrChar)) {
          const abcNoteAndRhythm = splitAbcNoteAndRhythm(noteOrChar);
          const abcNote = abcNoteAndRhythm?.note ?? "";
          const rhythm = abcNoteAndRhythm?.rhythm ?? "";

          // get interval between the note and the scale steps
          const scientificNote = AbcNotation.abcToScientificNotation(abcNote);

          if (scaleOverAllOctaves.includes(scientificNote)) {
            // find the new note based on steps
            const transposedNote =
              scaleOverAllOctaves[
                (scaleOverAllOctaves.indexOf(scientificNote) -
                  steps +
                  scaleOverAllOctaves.length) %
                  scaleOverAllOctaves.length
              ];
            return `${AbcNotation.scientificToAbcNotation(transposedNote)}${rhythm}`;
          } else {
            return `${TODO_PLACEHOLDER}${noteOrChar}`;
          }
        }
        return noteOrChar;
      }),
    ),
  );
  console.log({ transposedMeasuresWithPlaceholders });
  const fillTodos = transposedMeasuresWithPlaceholders.map((measure) =>
    measure
      .map((notes) =>
        notes
          .map((noteOrChar, i) => {
            if (noteOrChar.startsWith(TODO_PLACEHOLDER)) {
              const nonScaleToneAbcNote = noteOrChar.slice(
                TODO_PLACEHOLDER.length,
              );
              console.log({ nonScaleToneAbcNote });
              // figure out if this is chromatic up or down
              // if the last note is high and the next note is low, we approach from above
              // if the last note is low and the next is high, we approach from below
              let previousNote;
              // maybe there is a rest or | just before this note
              // iterate backwards to the true previous note that is not a rest or bar
              for (let j = i - 1; j >= 0; j--) {
                const candidate = notes[j];

                if (candidate && isAbcNote(candidate)) {
                  previousNote = candidate;
                  break;
                }
              }
              let nextNote;
              // maybe there is a rest or | just after this note
              // iterate forwards to the true next note that is not a rest or bar
              for (let j = i + 1; j < notes.length; j++) {
                const candidate = notes[j];
                if (candidate && isAbcNote(candidate)) {
                  nextNote = candidate;
                  break;
                }
              }

              if (nonScaleToneResolution === "repeat-last-note") {
                // if first note is non-chord tone, i guess will leave it blank
                return previousNote;
              }

              if (nonScaleToneResolution === "chromatic-approach") {
                const abcNoteAndRhythm =
                  splitAbcNoteAndRhythm(nonScaleToneAbcNote);
                const rhythm = abcNoteAndRhythm?.rhythm ?? "";
                console.log({ rhythm });
                console.log({ previousNote, nextNote });
                if (!previousNote || !nextNote) return nonScaleToneAbcNote;

                const midiNextNote = abcNoteToMidi(nextNote) ?? 0;
                const midiPreviousNote = abcNoteToMidi(previousNote) ?? 0;

                console.log({ midiNextNote, midiPreviousNote });
                const difference =
                  (midiNextNote ?? 0) - (midiPreviousNote ?? 0);
                console.log({ difference });
                if (difference < 0) {
                  // approach from above
                  console.log(
                    "approach from above",
                    convertMidiNumberToABC(midiNextNote + 1),
                    { rhythm },
                  );
                  return `${convertMidiNumberToABC(midiNextNote + 1)}${rhythm}`;
                } else if (difference > 0) {
                  // approach from below
                  return `${convertMidiNumberToABC(midiNextNote - 1)}${rhythm}`;
                }
                return nonScaleToneAbcNote;
              }
            }
            return noteOrChar;
          })
          .join(" "),
      )
      .join("|"),
  );

  console.log({ fillTodos });

  return fillTodos;
  return body.map((line) => {
    // First we generate the steps for notes that are in the scale
    // Leaving placeholders for non-scale tones
    // then we fill those based on the behavior defined by nonScaleToneResolution
    const lineWithPlacholders = transposeAbcLine(
      line,
      (midi) => transposeDownByScaleSteps([midi], steps, scaleNotes)[0],
      altered,
    );

    return lineWithPlacholders;
  });
}

// Same rhythm, bars and rests as the input, with every pitch moved down
export function transposeAbcDownByScaleSteps(
  abc: string,
  steps: number,
  scaleNotes: string,
  nonScaleToneResolution: NonScaleToneResolution,
): string {
  const { header, body } = splitAbc(abc);
  return [
    ...header,
    ...transposeBody(body, steps, scaleNotes, nonScaleToneResolution),
  ].join("\n");
}

// The melody plus each voice as separate ABC voices, so they render and play together
export function buildVoicesAbc(
  melodyAbc: string,
  stepsBelow: number[],
  scaleNotes: string,
  nonScaleToneResolution: NonScaleToneResolution,
): string {
  const { header, body } = splitAbc(melodyAbc);
  if (!body.some((line) => line.trim())) return "";

  const ids = [0, ...stepsBelow].map((_, i) => i + 1);
  const voices = [0, ...stepsBelow].map(
    (steps, i) =>
      `V:${i + 1}\n${transposeBody(body, steps, scaleNotes, nonScaleToneResolution).join("\n")}`,
  );
  return [...header, `%%score ${ids.join(" ")}`, ...voices].join("\n");
}
