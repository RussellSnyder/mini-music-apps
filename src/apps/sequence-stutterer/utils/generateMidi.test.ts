import { Midi } from "@tonejs/midi";
import { describe, expect, it } from "vitest";
import {
  buildMidiFileName,
  generateMidiFile,
  uint8ArrayToDataUri,
} from "./generateMidi";

describe("generateMidiFile", () => {
  it("generates a Uint8Array MIDI file from pattern rows", () => {
    const patternRows = [
      [60, 62, 64],
      [62, 64, 65],
    ];
    const midiBytes = generateMidiFile(patternRows);
    expect(midiBytes).toBeInstanceOf(Uint8Array);
    expect(midiBytes.length).toBeGreaterThan(0);
  });

  it("handles empty pattern rows gracefully", () => {
    const midiBytes = generateMidiFile([]);
    expect(midiBytes).toBeInstanceOf(Uint8Array);
  });

  it.each([
    ["", 0.125],
    ["2", 0.25],
    ["4", 0.5],
    ["8", 1],
    ["16", 2],
  ])("uses the ABC rhythm %s as a MIDI note duration", (rhythm, duration) => {
    const midiBytes = generateMidiFile([[60]], rhythm);
    const midi = new Midi(midiBytes.buffer as ArrayBuffer);

    expect(midi.tracks[0].notes[0].duration).toBeCloseTo(duration);
  });
});

describe("uint8ArrayToDataUri", () => {
  it("converts a Uint8Array to a data:audio/midi;base64 Data URI", () => {
    const data = new Uint8Array([77, 84, 104, 100]); // "MThd"
    const uri = uint8ArrayToDataUri(data);
    expect(uri).toContain("data:audio/midi;base64,");
  });
});

describe("buildMidiFileName", () => {
  it("combines original file name and pattern into a valid filename", () => {
    const name = buildMidiFileName("my-song.mid", "1, 2, 3, 4, 5");
    expect(name).toBe("my-song-1-2-3-4-5.mid");
  });

  it("handles file names without extension", () => {
    const name = buildMidiFileName("song", "1, 4, 2");
    expect(name).toBe("song-1-4-2.mid");
  });
});
