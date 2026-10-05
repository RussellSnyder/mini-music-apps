export const DEFAULT_KEYS = [
  "C",
  "C#",
  "D",
  "Eb",
  "E",
  "F",
  "F#",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];

export const SUPPORTED_OCTAVES = [2, 3, 4, 5];

export const SUPPORTED_ROOTS = SUPPORTED_OCTAVES.flatMap((octave) =>
  DEFAULT_KEYS.map((key) => `${key}${octave}`),
);

const SCALE_SPELLING_TEMPLATE = {
  major: {
    C: ["C", "D", "E", "F", "G", "A", "B"],
    "C#": ["^C", "^D", "^E", "^F", "^G", "^A", "^B"],
    Db: ["_D", "_E", "_F", "_G", "_A", "_B", "c"],
    D: ["D", "E", "^F", "G", "A", "B", "^C"],
    Eb: ["_E", "F", "G", "_A", "_B", "c", "d"],
    E: ["E", "^F", "^G", "A", "B", "C", "^D"],
    "F#": ["^F", "^G", "^A", "B", "^c", "^d", "^e"],
    F: ["F", "G", "A", "_B", "c", "d", "e"],
    Gb: ["_G", "_A", "_B", "_C", "_D", "_E", "F"],
    G: ["G", "A", "B", "C", "D", "E", "^F"],
    Ab: ["_A", "_B", "c", "_d", "_e", "_f", "g"],
    A: ["A", "B", "^C", "D", "E", "^F", "^G"],
    Bb: ["_B", "c", "d", "_e", "f", "g", "a"],
    B: ["B", "^c", "d", "e", "^f", "^g", "^a"],
  },
  melodicMinor: {
    C: ["C", "D", "_E", "F", "G", "A", "B"],
    "C#": ["^C", "^D", "E", "^F", "^G", "^A", "^B"],
    Db: ["_D", "_E", "__F", "_G", "_A", "_B", "c"],
    D: ["D", "E", "F", "G", "A", "B", "^C"],
    Eb: ["_E", "F", "_G", "_A", "_B", "c", "d"],
    E: ["E", "^F", "G", "A", "B", "C", "^D"],
    "F#": ["^F", "^G", "A", "B", "^c", "^d", "^e"],
    F: ["F", "G", "_A", "_B", "c", "d", "e"],
    Gb: ["_G", "_A", "_B", "_C", "_D", "_E", "F"],
    G: ["G", "A", "_B", "C", "D", "E", "^F"],
    Ab: ["_A", "_B", "__C", "_D", "_E", "_F", "G"],
    A: ["A", "B", "C", "D", "E", "^F", "^G"],
    Bb: ["_B", "c", "_d", "_e", "f", "g", "a"],
    B: ["B", "^c", "d", "e", "^f", "^g", "^a"],
  },
  harmonicMinor: {
    C: ["C", "D", "_E", "F", "G", "_A", "B"],
    "C#": ["^C", "^D", "E", "^F", "^G", "A", "^B"],
    Db: ["C", "_D", "_E", "__F", "_G", "_A", "__B"],
    D: ["^C", "D", "E", "F", "G", "A", "_B"],
    Eb: ["_C", "D", "_E", "F", "_G", "_A", "_B"],
    E: ["C", "^D", "E", "^F", "G", "A", "B"],
    "F#": ["^C", "D", "^E", "^F", "^G", "A", "B"],
    F: ["F", "G", "_A", "_B", "c", "_d", "e"],
    Gb: ["_G", "_A", "_B", "_C", "_D", "D", "F"],
    G: ["G", "A", "B", "C", "D", "_E", "^F"],
    Ab: ["_A", "_B", "__C", "_D", "_E", "E", "G"],
    A: ["A", "B", "C", "D", "E", "F", "^G"],
    Bb: ["_B", "c", "_d", "_e", "f", "g", "a"],
    B: ["B", "^c", "d", "e", "^f", "g", "^a"],
  },
  harmonicMajor: {
    C: ["C", "D", "E", "F", "G", "_A", "B"],
    "C#": ["^C", "^D", "^E", "^F", "^G", "A", "^B"],
    Db: ["_D", "_E", "_F", "_G", "_A", "__B", "c"],
    D: ["D", "E", "^F", "G", "A", "_B", "^C"],
    Eb: ["_E", "F", "G", "_A", "_B", "_c", "d"],
    E: ["E", "^F", "^G", "A", "B", "_C", "^D"],
    "F#": ["^F", "^G", "^A", "B", "^c", "d", "^e"],
    F: ["F", "G", "A", "_B", "c", "_d", "e"],
    Gb: ["_G", "_A", "_B", "_C", "_D", "__E", "F"],
    G: ["G", "A", "B", "C", "D", "_E", "^F"],
    Ab: ["_A", "_B", "c", "_d", "_e", "__f", "g"],
    A: ["A", "B", "^C", "D", "E", "F", "^G"],
    Bb: ["_B", "c", "d", "_e", "f", "_g", "a"],
    B: ["B", "^c", "d", "e", "^f", "g", "^a"],
  },
};

export const TONAL_SYSTEMS = [
  {
    id: "abc-major",
    abcId: 2,
    title: "Major",
    ariaLabel: "major scale notation",
    scale: "major",
    chordQualities: [
      { label: "△7", value: "maj7" },
      { label: "-7", value: "m7" },
      { label: "-7", value: "m7" },
      { label: "△7", value: "maj7" },
      { label: "7", value: "7" },
      { label: "-7", value: "m7" },
      { label: "ø7", value: "m7b5" },
    ],
    triadQualities: ["maj", "min", "min", "maj", "maj", "min", "dim"],
  },
  {
    id: "abc-melodic-minor",
    abcId: 3,
    title: "Melodic Minor",
    ariaLabel: "melodic minor notation",
    scale: "melodic Minor",
    chordQualities: [
      { label: "-△7", value: "-maj7" },
      { label: "-7", value: "m7" },
      { label: "+△7", value: "maj7#5" },
      { label: "7", value: "7" },
      { label: "7", value: "7" },
      { label: "ø7", value: "m7b5" },
      { label: "ø7", value: "m7b5" },
    ],
    triadQualities: ["min", "min", "aug", "maj", "maj", "dim", "dim"],
    extraChords: [
      {
        afterDegree: 6,
        degree: 6,
        quality: "7b5",
        noteDegrees: [0, 3, 4, 6],
        intervalsInRelationToRoot: ["M7", "m10", "P11", "M13"],
        noteAlterations: { 1: 0 },
        showSymbol: true,
        parenthesized: true,
      },
      {
        afterDegree: 6,
        degree: 6,
        quality: "7b5",
        noteDegrees: [0, 2, 4, 6],
        intervalsInRelationToRoot: ["M7", "A9", "P11", "M13"],
        noteAlterations: { 1: 1 },
        showSymbol: false,
        parenthesized: true,
      },
    ],
    scaleNotes: { ...SCALE_SPELLING_TEMPLATE.melodicMinor },
  },
  {
    id: "abc-harmonic-minor",
    abcId: 4,
    title: "Harmonic Minor",
    scale: "harmonic minor",
    ariaLabel: "harmonic minor notation",
    chordQualities: [
      { label: "-△7", value: "-maj7" },
      { label: "ø7", value: "m7b5" },
      { label: "+△7", value: "maj7#5" },
      { label: "-7", value: "min7" },
      { label: "7", value: "7" },
      { label: "△7", value: "maj7" },
      { label: "o7", value: "dim7" },
    ],
    triadQualities: ["min", "dim", "aug", "min", "maj", "maj", "dim"],
    extraChords: [
      {
        afterDegree: 3,
        degree: 3,
        quality: "ø7",
        noteDegrees: [0, 2, 3, 6],
        intervalsInRelationToRoot: ["P4", "m6", "M7", "m10"],
        noteAlterations: { 1: 0 },
        showSymbol: true,
        parenthesized: true,
      },
      {
        afterDegree: 5,
        degree: 5,
        quality: "-△7",
        noteDegrees: [0, 2, 4, 6],
        intervalsInRelationToRoot: ["m6", "M7", "m10", "P12"],
        noteAlterations: { 1: -1 },
        showSymbol: true,
        parenthesized: true,
      },
    ],
    scaleNotes: { ...SCALE_SPELLING_TEMPLATE.harmonicMinor },
  },
  {
    id: "abc-harmonic-major",
    abcId: 5,
    title: "Harmonic Major",
    scale: "harmonic major",
    ariaLabel: "harmonic major notation",
    chordQualities: [
      { label: "△7", value: "maj7" },
      { label: "ø7", value: "m7b5" },
      { label: "min7", value: "min7" },
      { label: "-△7", value: "-maj7" },
      { label: "7", value: "7" },
      { label: "+△7", value: "maj7#5" },
      { label: "o7", value: "dim7" },
    ],
    triadQualities: ["maj", "dim", "min", "min", "maj", "aug", "dim"],
    extraChords: [
      {
        afterDegree: 0,
        quality: "-△7",
        intervalsInRelationToRoot: ["P1", "M3", "m6", "M7"],
        showSymbol: true,
        parenthesized: true,
      },
      {
        afterDegree: 0,
        quality: "",
        intervalsInRelationToRoot: ["P1", "M3", "A5", "M7"],
        showSymbol: false,
      },
      {
        afterDegree: 2,
        quality: "7",
        intervalsInRelationToRoot: ["M3", "m6", "M7", "M9"],
        showSymbol: true,
        parenthesized: true,
      },
      {
        afterDegree: 2,
        quality: "",
        intervalsInRelationToRoot: ["M3", "A5", "M7", "M9"],
        showSymbol: false,
      },
    ],
    scaleNotes: { ...SCALE_SPELLING_TEMPLATE.harmonicMajor },
  },
];

export const CHORD_SCALES = [
  {
    name: "△7",
    chord: "maj7",
    scales: [
      {
        name: "Major",
        distanceFromRoot: "P1",
      },
      {
        name: "Major",
        distanceFromRoot: "P5",
      },
      {
        name: "Harmonic Minor",
        distanceFromRoot: "M3",
      },
      {
        name: "Harmonic Major",
        distanceFromRoot: "P1",
      },
    ],
  },
  {
    name: "△7(#5)",
    chord: "+maj7",
    scales: [
      {
        name: "Melodic Minor",
        distanceFromRoot: "M6",
      },
      {
        name: "Harmonic Minor",
        distanceFromRoot: "M6",
      },
      {
        name: "Harmonic Major",
        distanceFromRoot: "P1",
      },
      {
        name: "Harmonic Major",
        distanceFromRoot: "M3",
      },
    ],
  },
  {
    name: "-△7",
    chord: "-maj7",
    scales: [
      {
        name: "Melodic Minor",
        distanceFromRoot: "P1",
      },
      {
        name: "Harmonic Minor",
        distanceFromRoot: "P1",
      },
      {
        name: "Harmonic Minor",
        distanceFromRoot: "M3",
      },
      {
        name: "Harmonic Major",
        distanceFromRoot: "P5",
      },
    ],
  },
  {
    name: "-7",
    chord: "-7",
    scales: [
      {
        name: "Major",
        distanceFromRoot: "M7",
      },
      {
        name: "Major",
        distanceFromRoot: "m3",
      },
      {
        name: "Major",
        distanceFromRoot: "m6",
      },
      {
        name: "Melodic Minor",
        distanceFromRoot: "m7",
      },
      {
        name: "Harmonic Minor",
        distanceFromRoot: "P5",
      },
      {
        name: "Harmonic Major",
        distanceFromRoot: "m6",
      },
    ],
  },
  {
    name: "ø7",
    chord: "m7b5",
    scales: [
      {
        name: "Major",
        distanceFromRoot: "m2",
      },
      {
        name: "Melodic Minor",
        distanceFromRoot: "m3",
      },
      {
        name: "Melodic Minor",
        distanceFromRoot: "m2",
      },
      {
        name: "Harmonic Minor",
        distanceFromRoot: "P5",
      },
      {
        name: "Harmonic Minor",
        distanceFromRoot: "m7",
      },
      {
        name: "Harmonic Major",
        distanceFromRoot: "m7",
      },
    ],
  },
  {
    name: "7",
    chord: "7",
    scales: [
      {
        name: "Major",
        distanceFromRoot: "P4",
      },
      {
        name: "Melodic Minor",
        distanceFromRoot: "P4",
      },
      {
        name: "Melodic Minor",
        distanceFromRoot: "P5",
      },
      {
        name: "Harmonic Minor",
        distanceFromRoot: "P4",
      },
      {
        name: "Harmonic Major",
        distanceFromRoot: "P4",
      },
      {
        name: "Harmonic Major",
        distanceFromRoot: "m6",
      },
    ],
  },
  {
    name: "7b5",
    chord: "7b5",
    scales: [
      {
        name: "Melodic Minor",
        distanceFromRoot: "P5",
      },
      {
        name: "Melodic Minor",
        distanceFromRoot: "m2",
      },
    ],
  },
  {
    name: "7#5",
    chord: "7#5",
    scales: [
      {
        name: "Melodic Minor",
        distanceFromRoot: "P4",
      },
      {
        name: "Melodic Minor",
        distanceFromRoot: "m2",
      },
      {
        name: "Harmonic Minor",
        distanceFromRoot: "P4",
      },
      {
        name: "Harmonic Major",
        distanceFromRoot: "m6",
      },
    ],
  },
  {
    name: "7#9",
    chord: "7#9",
    scales: [
      {
        name: "Melodic Minor",
        distanceFromRoot: "m2",
      },
      {
        name: "Harmonic Major",
        distanceFromRoot: "m6",
      },
    ],
  },
  {
    name: "7sus4",
    chord: "7sus4",
    scales: [
      {
        name: "Major",
        distanceFromRoot: "P4",
      },
      {
        name: "Major",
        distanceFromRoot: "m7",
      },
      {
        name: "Major",
        distanceFromRoot: "m3",
      },
      {
        name: "Major",
        distanceFromRoot: "m6",
      },
      {
        name: "Melodic Minor",
        distanceFromRoot: "P4",
      },
      {
        name: "Melodic Minor",
        distanceFromRoot: "m7",
      },
      {
        name: "Harmonic Minor",
        distanceFromRoot: "P4",
      },
      {
        name: "Harmonic Major",
        distanceFromRoot: "P4",
      },
    ],
  },
  {
    name: "o7",
    chord: "dim7",
    scales: [
      {
        name: "Harmonic Minor",
        distanceFromRoot: "m2",
      },
      {
        name: "Harmonic Minor",
        distanceFromRoot: "M3",
      },
      {
        name: "Harmonic Minor",
        distanceFromRoot: "P5",
      },
      {
        name: "Harmonic Minor",
        distanceFromRoot: "m7",
      },
      {
        name: "Harmonic Major",
        distanceFromRoot: "m2",
      },
      {
        name: "Harmonic Major",
        distanceFromRoot: "M3",
      },
      {
        name: "Harmonic Major",
        distanceFromRoot: "P5",
      },
      {
        name: "Harmonic Major",
        distanceFromRoot: "m7",
      },
    ],
  },
];
