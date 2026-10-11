import { describe, expect, it } from "vitest";
import { parseScientificNote } from "./scientificNotation";

describe("parseScientificNote", () => {
  it.each([
    ["C4", "C", 4],
    ["C#4", "C#", 4],
    ["Bb3", "Bb", 3],
    ["F##2", "F##", 2],
    ["A-1", "A", -1],
    ["G10", "G", 10],
    [" D5 ", "D", 5],
  ])("%s", (input, note, octave) =>
    expect(parseScientificNote(input)).toEqual({ note, octave }),
  );

  it.each(["C", "Eb", "_C", "C4x", ""])("%s has no octave", (input) =>
    expect(parseScientificNote(input)).toEqual({ note: input, octave: null }),
  );
});
