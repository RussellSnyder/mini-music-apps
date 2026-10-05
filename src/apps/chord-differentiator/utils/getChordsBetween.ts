import { Note } from "@tonaljs/tonal";
import { noteNameToMidi } from "./noteUtils";

export type Chord = string[];

export type GetChordsBetweenInput = {
  startChord: Chord;
  endChord: Chord;
  numberOfSteps: number;
};

export function getChordsBetween(input: GetChordsBetweenInput): Chord[];
export function getChordsBetween(
  startChord: Chord,
  endChord: Chord,
  numberOfSteps: number,
): Chord[];
export function getChordsBetween(
  inputOrStartChord: GetChordsBetweenInput | Chord,
  inputEndChord?: Chord,
  inputNumberOfSteps?: number,
): Chord[] {
  const { startChord, endChord, numberOfSteps } = Array.isArray(
    inputOrStartChord,
  )
    ? {
        startChord: inputOrStartChord,
        endChord: inputEndChord ?? [],
        numberOfSteps: inputNumberOfSteps ?? 0,
      }
    : inputOrStartChord;

  if (
    !Number.isInteger(numberOfSteps) ||
    numberOfSteps <= 0 ||
    startChord.length !== endChord.length
  ) {
    return [];
  }

  const startMidi = startChord.map(noteNameToMidi);
  const endMidi = endChord.map(noteNameToMidi);

  if (
    startMidi.some((midiValue) => midiValue === null) ||
    endMidi.some((midiValue) => midiValue === null)
  ) {
    return [];
  }

  const validStartMidi = startMidi as number[];
  const validEndMidi = endMidi as number[];

  return Array.from({ length: numberOfSteps }, (_, stepIndex) => {
    const progress = (stepIndex + 1) / (numberOfSteps + 1);

    return validStartMidi.map((startMidiValue, noteIndex) => {
      const midiValue = Math.round(
        startMidiValue + (validEndMidi[noteIndex] - startMidiValue) * progress,
      );

      return Note.fromMidi(midiValue);
    });
  });
}
