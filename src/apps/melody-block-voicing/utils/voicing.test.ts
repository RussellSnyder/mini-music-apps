import { describe, expect, it } from "vitest";
import { buildVoicesAbc, transposeAbcDownByScaleSteps } from "./voicing";

describe("transposeAbcDownByScaleSteps", () => {
  it("keeps rhythm, rests and bars while moving pitches", () => {
    const abc = "M:4/4\nL:1/4\nE G3/2 z/2 c2 | A4 |";
    expect(
      transposeAbcDownByScaleSteps(abc, 2, "C", "major", "repeat-last-note"),
    ).toBe("M:4/4\nL:1/4\nC E3/2 z/2 A2 | F4 |");
  });
});

describe("buildVoicesAbc", () => {
  it("emits the melody and each voice with the same rhythm", () => {
    const out = buildVoicesAbc(
      "L:1/8\nE2 G |",
      [2],
      "C",
      "major",
      "repeat-last-note",
    );
    expect(out).toContain("V:1\nE2 G |");
    expect(out).toContain("V:2\nC2 E |");
  });

  it("ignores blank lines so the tune is not split", () => {
    const out = buildVoicesAbc(
      "\nM:4/4\nL:1/4\nE G |\n",
      [2],
      "C",
      "major",
      "repeat-last-note",
    );
    expect(out).not.toMatch(/\n\n/);
    expect(out.startsWith("\n")).toBe(false);
  });
});
