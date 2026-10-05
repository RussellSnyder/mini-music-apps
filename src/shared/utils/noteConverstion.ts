import { Midi as ToneMidi } from "@tonejs/midi";
import { AbcNotation, Midi as TonalMidi } from "tonal";

export function convertMidiNumberToABC(midiNumber: number, noteRhythm = "4") {
  const noteName = TonalMidi.midiToNoteName(midiNumber);
  return AbcNotation.scientificToAbcNotation(noteName) + noteRhythm;
}

function processMeasureAccidentals(notes: string[]): string[] {
  const alteredPitchClasses = new Set<string>();
  return notes.map((note) => {
    const match = note.match(/^([_^=]*)([a-gA-G])([',]*)$/);
    if (!match) return note;
    const [, accidental, letter, octave] = match;
    const upperLetter = letter.toUpperCase();

    if (accidental && accidental !== "=") {
      alteredPitchClasses.add(upperLetter);
      return note;
    } else if (!accidental && alteredPitchClasses.has(upperLetter)) {
      return `=${letter}${octave}`;
    }
    return note;
  });
}

export function generateAbcNotation(
  patternRows: number[][],
  noteRhythm = "4",
): string {
  if (patternRows.length === 0) return "";

  const lines = patternRows.map((row) => {
    const rawNotes = row.map((midi) =>
      convertMidiNumberToABC(midi, noteRhythm),
    );
    const processedNotes = processMeasureAccidentals(rawNotes);
    return processedNotes.join(" ") + " |";
  });

  return `M:4/4\nL:1/16\n${lines.join("\n")}`;
}

export function parseMidiFileToAbc(
  arrayBuffer: ArrayBuffer,
  fileName = "Uploaded MIDI",
): { abcNotation: string; midiNotes: number[] } {
  const midi = new ToneMidi(arrayBuffer);
  const rawNotes: { midi: number; time: number }[] = [];

  midi.tracks.forEach((track) => {
    track.notes.forEach((note) => {
      rawNotes.push({ midi: note.midi, time: note.time });
    });
  });

  // Sort notes chronologically by start time, and then by MIDI pitch
  rawNotes.sort((a, b) => a.time - b.time || a.midi - b.midi);

  // Filter out duplicate notes occurring at the exact same start time and pitch
  const uniqueNotes: { midi: number; time: number }[] = [];
  rawNotes.forEach((note) => {
    const isDuplicate = uniqueNotes.some(
      (existing) =>
        Math.abs(existing.time - note.time) < 0.01 &&
        existing.midi === note.midi,
    );
    if (!isDuplicate) {
      uniqueNotes.push(note);
    }
  });

  const midiNotes = uniqueNotes.map((n) => n.midi);
  if (midiNotes.length === 0) {
    return { abcNotation: "", midiNotes: [] };
  }

  // Group notes starting at approximately the same time into chords
  const timeClusters: { midiList: number[]; time: number }[] = [];
  uniqueNotes.forEach((note) => {
    const lastCluster = timeClusters[timeClusters.length - 1];
    if (lastCluster && Math.abs(note.time - lastCluster.time) < 0.05) {
      if (!lastCluster.midiList.includes(note.midi)) {
        lastCluster.midiList.push(note.midi);
      }
    } else {
      timeClusters.push({ midiList: [note.midi], time: note.time });
    }
  });

  const abcElements = timeClusters.map((cluster) => {
    if (cluster.midiList.length === 1) {
      return convertMidiNumberToABC(cluster.midiList[0]);
    }
    const chordNotes = cluster.midiList
      .map((m) => convertMidiNumberToABC(m))
      .filter(Boolean)
      .join("");
    return `[${chordNotes}]`;
  });

  const measures: string[] = [];
  const notesPerMeasure = 4;
  for (let i = 0; i < abcElements.length; i += notesPerMeasure) {
    const rawMeasureNotes = abcElements.slice(i, i + notesPerMeasure);
    const processedMeasureNotes = processMeasureAccidentals(rawMeasureNotes);
    measures.push(processedMeasureNotes.join(" "));
  }

  const title = fileName.replace(/\.[^/.]+$/, "");
  const abcNotation = `X:1\nT:${title}\nM:4/4\nL:1/4\nK:C\n${measures.join(" | ")} |`;

  return { abcNotation, midiNotes };
}
