// @ts-expect-error midi-writer-js lacks explicit ESM export types
import MidiWriter from "midi-writer-js";
import type { Chord } from "./getChordsBetween";
import { noteNameToMidi } from "./noteUtils";

export function createMidiFromChords(
  chords: Chord[],
): InstanceType<typeof MidiWriter.Writer> {
  const track = new MidiWriter.Track();

  chords.forEach((chord) => {
    const validNotes = chord.filter((note) => noteNameToMidi(note) !== null);

    if (validNotes.length > 0) {
      track.addEvent(
        new MidiWriter.NoteEvent({
          pitch: validNotes,
          duration: "4",
        }),
      );
    }
  });

  return new MidiWriter.Writer(track);
}
