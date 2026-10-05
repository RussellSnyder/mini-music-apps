import { describe, expect, it } from "vitest";
// @ts-expect-error midi-writer-js lacks explicit ESM export types
import MidiWriter from "midi-writer-js";
import {
  convertMidiNumberToABC,
  generateAbcNotation,
  parseMidiFileToAbc,
} from "./noteConverstion.ts";

describe("convertMidiNumberToABC", () => {
  it("converts middle C (MIDI 60 / C4) to C", () => {
    expect(convertMidiNumberToABC(60)).toBe("C4");
  });

  it("converts C5 (MIDI 72) to c", () => {
    expect(convertMidiNumberToABC(72)).toBe("c4");
  });

  it("converts C6 (MIDI 84) to c'", () => {
    expect(convertMidiNumberToABC(84)).toBe("c'4");
  });

  it("converts C3 (MIDI 48) to C,", () => {
    expect(convertMidiNumberToABC(48)).toBe("C,4");
  });

  it("converts accidentals like Db4 (MIDI 61) to _D", () => {
    expect(convertMidiNumberToABC(61)).toBe("_D4");
  });

  it("uses a custom note rhythm suffix", () => {
    expect(convertMidiNumberToABC(60, "16")).toBe("C16");
  });
});

describe("generateAbcNotation", () => {
  it("generates ABC string for pattern rows", () => {
    const input = [
      [60, 65, 64, 62],
      [65, 64, 62, 60],
    ];
    const abc = generateAbcNotation(input);
    expect(abc).toContain("C4 F4 E4 D4 |\nF4 E4 D4 C4 |");
  });

  it("handles accidentals like Eb (63) followed by E (64) in the same measure", () => {
    const input = [[63, 64, 63, 64]];
    const abc = generateAbcNotation(input);
    expect(abc).toContain("_E4 E4 _E4 E4 |");
  });

  it("uses the fixed base rhythm in the ABC header", () => {
    const input = [[60]];
    expect(generateAbcNotation(input)).toContain("L:1/16");
    expect(generateAbcNotation(input, "16")).toContain("L:1/16");
  });

  it("returns empty string for empty pattern", () => {
    expect(generateAbcNotation([])).toBe("");
  });
});

describe("parseMidiFileToAbc", () => {
  it("parses a MIDI file buffer into ABC notation and MIDI notes array", () => {
    const track = new MidiWriter.Track();
    track.addEvent(
      new MidiWriter.NoteEvent({ pitch: ["C4", "E4", "G4"], duration: "4" }),
    );
    const write = new MidiWriter.Writer(track);
    const uint8Array = write.buildFile();
    const arrayBuffer = uint8Array.buffer;

    const result = parseMidiFileToAbc(arrayBuffer, "test-song.mid");
    expect(result.midiNotes).toEqual([60, 64, 67]);
    expect(result.abcNotation).toContain("X:1");
    expect(result.abcNotation).toContain("T:test-song");
    expect(result.abcNotation).toContain("[C4E4G4]");
  });
});
