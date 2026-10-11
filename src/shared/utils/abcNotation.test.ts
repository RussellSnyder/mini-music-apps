import { describe, expect, it } from "vitest";
import {
  abcNoteToMidi,
  compareAbcNotes,
  isAbcNote,
  isAbcNoteHigher,
  isAbcNoteLower,
  isAbcNotes,
  splitAbcNoteAndRhythm,
} from "./abcNotation";

describe("isAbcNote", () => {
  it.each(["C", "c", "_C", "^^F", "=B", "g'", "C,", "G,2", "A3/2", "e/"])(
    "accepts %s",
    (value) => expect(isAbcNote(value)).toBe(true),
  );

  it.each(["C#4", "Db", "H", "", "CC", "4C", "C#", "__", "_"])(
    "rejects %s",
    (value) => expect(isAbcNote(value)).toBe(false),
  );
});

describe("isAbcNotes", () => {
  it("accepts space separated ABC notes", () => {
    expect(isAbcNotes("C _E G")).toBe(true);
  });

  it("rejects mixed or empty input", () => {
    expect(isAbcNotes("C C#4")).toBe(false);
    expect(isAbcNotes("  ")).toBe(false);
  });
});

describe("splitAbcNoteAndRhythm", () => {
  it.each([
    ["C", "C", ""],
    ["_C", "_C", ""],
    ["G,2", "G,", "2"],
    ["^f'3/2", "^f'", "3/2"],
    ["e/", "e", "/"],
    ["A/2", "A", "/2"],
  ])("%s", (input, note, rhythm) =>
    expect(splitAbcNoteAndRhythm(input)).toEqual({ note, rhythm }),
  );

  it("returns null for non ABC notes", () => {
    expect(splitAbcNoteAndRhythm("C#4")).toBeNull();
  });
});

describe("comparing ABC notes", () => {
  it("ignores rhythm", () => {
    expect(isAbcNoteLower("C4", "_E2")).toBe(true);
    expect(isAbcNoteHigher("_E2", "C4")).toBe(true);
  });

  it("treats lowercase as an octave above uppercase", () => {
    expect(abcNoteToMidi("C")).toBe(60);
    expect(abcNoteToMidi("c")).toBe(72);
    expect(isAbcNoteHigher("c", "C")).toBe(true);
  });

  it("handles accidentals and octave marks", () => {
    expect(abcNoteToMidi("^C")).toBe(61);
    expect(abcNoteToMidi("__B")).toBe(69);
    expect(abcNoteToMidi("c'")).toBe(84);
    expect(abcNoteToMidi("C,")).toBe(48);
    expect(compareAbcNotes("^C", "_D")).toBe(0);
  });

  it("throws for invalid notes", () => {
    expect(() => compareAbcNotes("C#4", "C")).toThrow();
  });
});

describe("abcNoteToMidi", () => {
  it.each([
    ["C", 60],
    ["c", 72],
    ["C,", 48],
    ["c'", 84],
    ["^C", 61],
    ["_E", 63],
    ["=F", 65],
    ["^^F", 67],
    ["__B", 69],
    ["G,2", 55],
    ["A3/2", 69],
    [" e/ ", 76],
  ])("%s -> %i", (input, midi) => expect(abcNoteToMidi(input)).toBe(midi));

  it.each(["C#4", "", "z", "H"])("returns null for %s", (input) =>
    expect(abcNoteToMidi(input)).toBeNull(),
  );
});
