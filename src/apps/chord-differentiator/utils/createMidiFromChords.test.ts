import { describe, expect, it } from "vitest";
import { createMidiFromChords } from "./createMidiFromChords";

describe("createMidiFromChords", () => {
  it("creates a MIDI file from generated chords", () => {
    const writer = createMidiFromChords([
      ["C4", "E4", "G4"],
      ["D4", "F4", "A4"],
    ]);

    expect(writer.buildFile()).toBeInstanceOf(Uint8Array);
    expect(writer.buildFile().length).toBeGreaterThan(0);
  });

  it("skips invalid and empty chords", () => {
    const writer = createMidiFromChords([["invalid"], [], ["C4"]]);

    expect(writer.buildFile().length).toBeGreaterThan(0);
  });
});
