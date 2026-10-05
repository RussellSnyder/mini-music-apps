import { describe, expect, it } from "vitest";
import { generatePattern } from "./generatePattern";

describe("generatePattern", () => {
  it("converts inputs, generates pattern rotations, and maps them to midi notes", () => {
    const midiNotes = "60, 62, 64, 65, 67, 69, 72";
    const midiOffset = 0;
    const pattern = "1, 2, 3";

    const result = generatePattern(midiNotes, midiOffset, pattern);
    expect(result).toEqual([
      [60, 62, 64],
      [62, 64, 65],
      [64, 65, 67],
      [65, 67, 69],
      [67, 69, 72],
    ]);
  });
});
