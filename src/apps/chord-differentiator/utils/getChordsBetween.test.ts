import { describe, expect, it } from "vitest";
import { getChordsBetween } from "./getChordsBetween";

describe("getChordsBetween", () => {
  it("returns the requested intermediate chords", () => {
    expect(getChordsBetween(["C4", "E4"], ["D4", "G4"], 2)).toEqual([
      ["Db4", "F4"],
      ["Db4", "Gb4"],
    ]);
  });

  it("accepts the object input form", () => {
    expect(
      getChordsBetween({
        startChord: ["C4", "E4"],
        endChord: ["D4", "G4"],
        numberOfSteps: 1,
      }),
    ).toEqual([["Db4", "Gb4"]]);
  });

  it("returns no chords for invalid inputs", () => {
    expect(getChordsBetween(["C4"], ["E4", "G4"], 2)).toEqual([]);
    expect(getChordsBetween(["H4"], ["E4"], 2)).toEqual([]);
    expect(getChordsBetween(["C4"], ["E4"], 0)).toEqual([]);
  });
});
