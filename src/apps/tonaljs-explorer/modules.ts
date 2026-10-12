import {
  AbcNotation,
  Chord,
  DurationValue,
  Interval,
  Key,
  Midi,
  Mode,
  Note,
  Pcset,
  Progression,
  Range,
  RhythmPattern,
  RomanNumeral,
  Scale,
  TimeSignature,
  Voicing,
} from "tonal";

export type Field = {
  id: string;
  label: string;
  defaultValue: string;
  options?: string[];
};

export type Demo = {
  label: string;
  code: (values: Record<string, string>) => string;
  run: (values: Record<string, string>) => unknown;
};

export type ExplorerModule = {
  id: string;
  title: string;
  description: string;
  docs: { label?: string; url: string }[];
  fields: Field[];
  demos: Demo[];
};

const list = (value: string) => value.split(/[\s,]+/).filter(Boolean);
const num = (value: string) => Number(value);

const ROOT_NOTES = ["C", "D", "E", "F", "G", "A", "B"].flatMap((letter) => [
  `${letter}b`,
  letter,
  `${letter}#`,
]);
const SCALE_NAMES = Scale.names();

const CMAJOR = ["C", "D", "E", "F", "G", "A", "B"];

const fmt = (value: unknown) => JSON.stringify(value);

type Values = Record<string, string>;

const scaleName = (v: Values) => `${v.root} ${v.scaleType}`;

// Builds a demo whose displayed snippet is generated from the exact arguments it runs with.
const call = (
  label: string,
  args: (v: Values) => unknown[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (...args: any[]) => unknown,
): Demo => ({
  label,
  code: (v) => `${label}(${args(v).map(fmt).join(", ")})`,
  run: (v) => fn(...args(v)),
});

export const MODULES: ExplorerModule[] = [
  {
    id: "note",
    title: "Note",
    description: "Properties, transposition and enharmonics of a note.",
    docs: [{ url: "https://tonaljs.github.io/tonal/docs/basics/notes" }],
    fields: [
      { id: "note", label: "Note", defaultValue: "C#4" },
      { id: "interval", label: "Interval", defaultValue: "5P" },
    ],
    demos: [
      call("Note.get", (v) => [v.note], Note.get),
      call("Note.transpose", (v) => [v.note, v.interval], Note.transpose),
      call("Note.enharmonic", (v) => [v.note], Note.enharmonic),
      call("Note.simplify", (v) => [v.note], Note.simplify),
      call("Note.midi", (v) => [v.note], Note.midi),
      call("Note.freq", (v) => [v.note], Note.freq),
      call("Note.fromMidi", (v) => [num(v.note) || 60], Note.fromMidi),
    ],
  },
  {
    id: "interval",
    title: "Interval",
    description: "Interval properties, distances and arithmetic.",
    docs: [{ url: "https://tonaljs.github.io/tonal/docs/basics/intervals" }],
    fields: [
      { id: "interval", label: "Interval", defaultValue: "5P" },
      { id: "from", label: "From note", defaultValue: "C4" },
      { id: "to", label: "To note", defaultValue: "G5" },
    ],
    demos: [
      call("Interval.get", (v) => [v.interval], Interval.get),
      call("Interval.semitones", (v) => [v.interval], Interval.semitones),
      call("Interval.invert", (v) => [v.interval], Interval.invert),
      call("Interval.simplify", (v) => [v.interval], Interval.simplify),
      call("Interval.distance", (v) => [v.from, v.to], Interval.distance),
      call(
        "Interval.fromSemitones",
        (v) => [num(v.interval) || 7],
        Interval.fromSemitones,
      ),
    ],
  },
  {
    id: "chord",
    title: "Chord",
    description: "Chord notes, intervals, detection and related scales.",
    docs: [{ url: "https://tonaljs.github.io/tonal/docs/groups/chords" }],
    fields: [
      { id: "chord", label: "Chord", defaultValue: "Cmaj7" },
      { id: "notes", label: "Notes (to detect)", defaultValue: "C E G B" },
      { id: "interval", label: "Transpose by", defaultValue: "2M" },
    ],
    demos: [
      call("Chord.get", (v) => [v.chord], Chord.get),
      call("Chord.detect", (v) => [list(v.notes)], Chord.detect),
      call("Chord.transpose", (v) => [v.chord, v.interval], Chord.transpose),
      call("Chord.extended", (v) => [v.chord], Chord.extended),
      call("Chord.reduced", (v) => [v.chord], Chord.reduced),
      call("Chord.chordScales", (v) => [v.chord], Chord.chordScales),
    ],
  },
  {
    id: "scale",
    title: "Scale",
    description: "Scale notes, detection, modes and the chords they contain.",
    docs: [{ url: "https://tonaljs.github.io/tonal/docs/groups/scales" }],
    fields: [
      { id: "root", label: "Root", defaultValue: "C", options: ROOT_NOTES },
      {
        id: "scaleType",
        label: "Scale",
        defaultValue: "major",
        options: SCALE_NAMES,
      },
      { id: "notes", label: "Notes (to detect)", defaultValue: "C D E F G A B" },
    ],
    demos: [
      call("Scale.get", (v) => [scaleName(v)], Scale.get),
      call("Scale.detect", (v) => [list(v.notes)], Scale.detect),
      call("Scale.scaleChords", (v) => [scaleName(v)], Scale.scaleChords),
      call("Scale.modeNames", (v) => [scaleName(v)], Scale.modeNames),
      call("Scale.extended", (v) => [scaleName(v)], Scale.extended),
      call("Scale.reduced", (v) => [scaleName(v)], Scale.reduced),
      {
        label: "Scale.degrees",
        code: (v) =>
          `[1, 2, 3, 4, 5].map((d) => Scale.degrees(${fmt(scaleName(v))})(d))`,
        run: (v) => [1, 2, 3, 4, 5].map((d) => Scale.degrees(scaleName(v))(d)),
      },
    ],
  },
  {
    id: "key",
    title: "Key",
    description: "Major and minor keys with their chords and harmony.",
    docs: [{ url: "https://tonaljs.github.io/tonal/docs/harmony/keys" }],
    fields: [{ id: "tonic", label: "Tonic", defaultValue: "C" }],
    demos: [
      call("Key.majorKey", (v) => [v.tonic], Key.majorKey),
      call("Key.minorKey", (v) => [v.tonic], Key.minorKey),
      {
        label: "Key.majorKeyChords",
        code: (v) => `Key.majorKey(${fmt(v.tonic)}).chords`,
        run: (v) => Key.majorKey(v.tonic).chords,
      },
      {
        label: "Key.minorKey harmonic",
        code: (v) => `Key.minorKey(${fmt(v.tonic)}).harmonic`,
        run: (v) => Key.minorKey(v.tonic).harmonic,
      },
    ],
  },
  {
    id: "mode",
    title: "Mode",
    description: "Modes and their notes, triads and seventh chords.",
    docs: [{ url: "https://tonaljs.github.io/tonal/docs/harmony/modes" }],
    fields: [
      { id: "mode", label: "Mode", defaultValue: "dorian" },
      { id: "tonic", label: "Tonic", defaultValue: "D" },
    ],
    demos: [
      call("Mode.get", (v) => [v.mode], Mode.get),
      call("Mode.notes", (v) => [v.mode, v.tonic], Mode.notes),
      call("Mode.triads", (v) => [v.mode, v.tonic], Mode.triads),
      call("Mode.seventhChords", (v) => [v.mode, v.tonic], Mode.seventhChords),
      call("Mode.names", () => [], Mode.names),
    ],
  },
  {
    id: "progression",
    title: "Progression",
    description: "Convert between chords and roman numerals.",
    docs: [{ label: "Progression", url: "https://tonaljs.github.io/tonal/docs/harmony/progressions" }],
    fields: [
      { id: "key", label: "Key", defaultValue: "C" },
      { id: "numerals", label: "Roman numerals", defaultValue: "ii V7 Imaj7" },
      { id: "chords", label: "Chords", defaultValue: "Dm7 G7 Cmaj7" },
    ],
    demos: [
      call(
        "Progression.fromRomanNumerals",
        (v) => [v.key, list(v.numerals)],
        Progression.fromRomanNumerals,
      ),
      call(
        "Progression.toRomanNumerals",
        (v) => [v.key, list(v.chords)],
        Progression.toRomanNumerals,
      ),
    ],
  },
  {
    id: "notation",
    title: "Notation",
    description: "Roman numerals and ABC notation.",
    docs: [
      { label: "Roman numeral", url: "https://tonaljs.github.io/tonal/docs/notation/roman-numerals" },
      { label: "ABC notation", url: "https://tonaljs.github.io/tonal/docs/notation/abc-notation" },
    ],
    fields: [
      { id: "numeral", label: "Roman numeral", defaultValue: "bVIIMaj7" },
      { id: "note", label: "Note (scientific)", defaultValue: "C#4" },
      { id: "abc", label: "ABC note", defaultValue: "^C" },
      { id: "interval", label: "Interval", defaultValue: "5P" },
      { id: "from", label: "From (ABC note)", defaultValue: "C" },
      { id: "to", label: "To (ABC note)", defaultValue: "g" },
    ],
    demos: [
      call("RomanNumeral.get", (v) => [v.numeral], RomanNumeral.get),
      call("RomanNumeral.tokenize", (v) => [v.numeral], RomanNumeral.tokenize),
      call("RomanNumeral.names", () => [], RomanNumeral.names),
      call(
        "AbcNotation.scientificToAbcNotation",
        (v) => [v.note],
        AbcNotation.scientificToAbcNotation,
      ),
      call(
        "AbcNotation.abcToScientificNotation",
        (v) => [v.abc],
        AbcNotation.abcToScientificNotation,
      ),
      call("AbcNotation.tokenize", (v) => [v.abc], AbcNotation.tokenize),
      call(
        "AbcNotation.transpose",
        (v) => [v.abc, v.interval],
        AbcNotation.transpose,
      ),
      call("AbcNotation.distance", (v) => [v.from, v.to], AbcNotation.distance),
    ],
  },
  {
    id: "midi",
    title: "Midi",
    description: "Convert between MIDI numbers, note names and frequencies.",
    docs: [{ label: "Midi", url: "https://tonaljs.github.io/tonal/docs/basics/midi" }],
    fields: [
      { id: "midi", label: "MIDI number", defaultValue: "61" },
      { id: "note", label: "Note", defaultValue: "A4" },
      { id: "freq", label: "Frequency (Hz)", defaultValue: "440" },
    ],
    demos: [
      call("Midi.midiToNoteName", (v) => [num(v.midi)], Midi.midiToNoteName),
      {
        label: "Midi.midiToNoteName (flats)",
        code: (v) =>
          `Midi.midiToNoteName(${fmt(num(v.midi))}, { sharps: false })`,
        run: (v) => Midi.midiToNoteName(num(v.midi), { sharps: false }),
      },
      call("Midi.toMidi", (v) => [v.note], Midi.toMidi),
      call("Midi.midiToFreq", (v) => [num(v.midi)], Midi.midiToFreq),
      call("Midi.freqToMidi", (v) => [num(v.freq)], Midi.freqToMidi),
    ],
  },
  {
    id: "range",
    title: "Range",
    description: "Numeric and chromatic ranges of notes.",
    docs: [{ url: "https://tonaljs.github.io/tonal/docs/utils/ranges" }],
    fields: [
      { id: "from", label: "From (note)", defaultValue: "C3" },
      { id: "to", label: "To (note)", defaultValue: "G3" },
      { id: "start", label: "Start (number)", defaultValue: "1" },
      { id: "end", label: "End (number)", defaultValue: "5" },
    ],
    demos: [
      call(
        "Range.numeric",
        (v) => [[num(v.start), num(v.end)]],
        Range.numeric,
      ),
      call("Range.chromatic", (v) => [[v.from, v.to]], Range.chromatic),
      {
        label: "Range.chromatic (flats)",
        code: (v) =>
          `Range.chromatic(${fmt([v.from, v.to])}, { sharps: false })`,
        run: (v) => Range.chromatic([v.from, v.to], { sharps: false }),
      },
    ],
  },
  {
    id: "pcset",
    title: "Pitch class set",
    description: "Set theory tools for collections of pitch classes.",
    docs: [{ url: "https://tonaljs.github.io/tonal/docs/groups/pitch-class-sets" }],
    fields: [{ id: "notes", label: "Notes", defaultValue: "C E G" }],
    demos: [
      call("Pcset.get", (v) => [list(v.notes)], Pcset.get),
      call("Pcset.modes", (v) => [list(v.notes)], Pcset.modes),
      {
        label: "Pcset.isSubsetOf (C major)",
        code: (v) =>
          `Pcset.isSubsetOf(${fmt(CMAJOR)})(${fmt(list(v.notes))})`,
        run: (v) => Pcset.isSubsetOf(CMAJOR)(list(v.notes)),
      },
    ],
  },
  {
    id: "voicing",
    title: "Voicing",
    description: "Chord voicings within a note range.",
    docs: [{ url: "https://github.com/tonaljs/tonal/tree/main/packages/voicing" }],
    fields: [
      { id: "chord", label: "Chord", defaultValue: "Dm7" },
      { id: "low", label: "Range low", defaultValue: "C3" },
      { id: "high", label: "Range high", defaultValue: "C5" },
    ],
    demos: [
      call("Voicing.get", (v) => [v.chord, [v.low, v.high]], Voicing.get),
      call("Voicing.search", (v) => [v.chord, [v.low, v.high]], Voicing.search),
    ],
  },
  {
    id: "rhythm",
    title: "Rhythm",
    description: "Duration values, time signatures and rhythm patterns.",
    docs: [{ label: "Duration", url: "https://tonaljs.github.io/tonal/docs/time/duration" }, { label: "Time signature", url: "https://tonaljs.github.io/tonal/docs/time/signatures" }, { label: "Pattern", url: "https://tonaljs.github.io/tonal/docs/time/patterns" }],
    fields: [
      { id: "duration", label: "Duration", defaultValue: "q" },
      { id: "signature", label: "Time signature", defaultValue: "6/8" },
      { id: "pulses", label: "Euclid beats", defaultValue: "3" },
      { id: "steps", label: "Euclid steps", defaultValue: "8" },
      { id: "hex", label: "Hex number", defaultValue: "8f" },
      { id: "onsets", label: "Onset sizes", defaultValue: "1 2 2 1" },
      { id: "threshold", label: "Random threshold (0-1)", defaultValue: "0.5" },
      {
        id: "probabilities",
        label: "Step probabilities (0-1)",
        defaultValue: "0.6 0 0.2 0.5",
      },
      { id: "pattern", label: "Pattern (0s and 1s)", defaultValue: "1 0 0 1" },
      { id: "rotations", label: "Rotations", defaultValue: "2" },
    ],
    demos: [
      call("DurationValue.get", (v) => [v.duration], DurationValue.get),
      call("TimeSignature.get", (v) => [v.signature], TimeSignature.get),
      call(
        "RhythmPattern.euclid",
        (v) => [num(v.steps), num(v.pulses)],
        RhythmPattern.euclid,
      ),
      call("RhythmPattern.binary", (v) => [num(v.pulses)], RhythmPattern.binary),
      call("RhythmPattern.hex", (v) => [v.hex], RhythmPattern.hex),
      call(
        "RhythmPattern.onsets",
        (v) => list(v.onsets).map(Number),
        RhythmPattern.onsets,
      ),
      call(
        "RhythmPattern.random",
        (v) => [num(v.steps), num(v.threshold)],
        RhythmPattern.random,
      ),
      call(
        "RhythmPattern.probability",
        (v) => [list(v.probabilities).map(Number)],
        RhythmPattern.probability,
      ),
      call(
        "RhythmPattern.rotate",
        (v) => [list(v.pattern).map(Number), num(v.rotations)],
        RhythmPattern.rotate,
      ),
    ],
  },
];
