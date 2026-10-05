import { Note, Scale } from "tonal";

export function noteNameToAbc(noteName) {
  const match = /^([A-Ga-g])([#b]{1,2})?(\d+)$/.exec(noteName);
  if (!match) return noteName;

  const [, letter, accidental = "", octaveString] = match;
  const octave = Number(octaveString ?? 4);
  let abcAccidental = "";

  switch (accidental) {
    case "bb":
      abcAccidental = `__`;
      break;
    case "b":
      abcAccidental = `_`;
      break;
    case "#":
      abcAccidental = `^`;
      break;
    case "##":
      abcAccidental = `^^`;
      break;
    default:
      break;
  }

  if (octave === 2) return `${abcAccidental}${letter},,`;
  if (octave === 3) return `${abcAccidental}${letter},`;
  if (octave === 4) return `${abcAccidental}${letter}`;
  if (octave === 5) return `${abcAccidental}${letter.toLowerCase()}`;
  if (octave === 6) return `${abcAccidental}${letter.toLowerCase()}'`;

  const diff = octave - 4;
  const octaveMarker = diff > 0 ? "'".repeat(diff) : ",".repeat(Math.abs(diff));
  return `${abcAccidental}${letter.toLowerCase()}${octaveMarker}`;
}

export function abcNoteToName(abcNote) {
  if (typeof abcNote !== "string") return abcNote;

  const match = /^([_^]*)([A-Ga-g])([',]*)$/.exec(abcNote.trim());
  if (!match) return abcNote;

  const [, accidental, letter] = match;
  const noteAccidental = accidental.startsWith("^")
    ? "#".repeat(accidental.length)
    : "b".repeat(accidental.length);

  return `${letter.toUpperCase()}${noteAccidental}`;
}

export function abcNoteToTonal(abcNote) {
  if (typeof abcNote !== "string") return null;

  const match = /^([_^]*)([A-Ga-g])([',]*)$/.exec(abcNote.trim());
  if (!match) return null;

  const [, accidental, letter, octaveMarks] = match;
  const noteAccidental = accidental.startsWith("^")
    ? "#".repeat(accidental.length)
    : "b".repeat(accidental.length);
  const octave =
    (letter === letter.toUpperCase() ? 4 : 5) +
    (octaveMarks.match(/'/g) || []).length -
    (octaveMarks.match(/,/g) || []).length;

  return `${letter.toUpperCase()}${noteAccidental}${octave}`;
}

export function abcPitchToMidi(abcPitch) {
  const tonalNote = abcNoteToTonal(abcPitch);
  return tonalNote ? Note.midi(tonalNote) : null;
}

export function createABCScale(root, scaleRoot, scale) {
  const range = Scale.rangeOf(`${scaleRoot} ${scale}`);
  const rangeStart = root.toUpperCase() + "4";
  const rangeEnd = Note.transpose(rangeStart, "M7");
  const notes = range(rangeStart, rangeEnd);
  return notes.map(noteNameToAbc);
}

export function chunkItems(items, size) {
  const chunks = [];

  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }

  return chunks;
}

export function groupScalesForDisplay(scales) {
  if (!Array.isArray(scales) || scales.length === 0) {
    return [];
  }

  if (scales.length === 6) {
    return chunkItems(scales, 3);
  }

  if (scales.length === 8) {
    return chunkItems(scales, 4);
  }

  return [scales];
}

export function tonal_getNoteAndOctave(noteOctaveString) {
  const match = noteOctaveString.match(/^([A-Ga-g])([#b]?)(\d)$/);

  return {
    note: `${match[1]}${match[2]}`,
    octave: Number(match[3]),
  };
}
