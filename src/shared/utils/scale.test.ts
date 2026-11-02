import { describe, expect, it } from "vitest";
import { sortScaleStartingWithC } from "./scale";

describe("sortScaleStartingWithC", () => {
  it("sorts a scale by pitch class starting at C", () => {
    expect(
      sortScaleStartingWithC(["A", "B", "C#", "D", "E", "F#", "G#"]),
    ).toEqual(["C#", "D", "E", "F#", "G#", "A", "B"]);
  });

  it("places C first when present and does not mutate the input", () => {
    const notes = ["G", "E", "C", "A"];

    expect(sortScaleStartingWithC(notes)).toEqual(["C", "E", "G", "A"]);
    expect(notes).toEqual(["G", "E", "C", "A"]);
  });

  it("retains unrecognized values after valid notes", () => {
    expect(sortScaleStartingWithC(["invalid", "G", "C"])).toEqual([
      "C",
      "G",
      "invalid",
    ]);
  });
});
