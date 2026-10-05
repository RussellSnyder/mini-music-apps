// @ts-expect-error midi-writer-js lacks explicit ESM export types
import MidiWriter from "midi-writer-js";

/**
 * Generates a MIDI file (Uint8Array) from pattern rows of MIDI note numbers.
 */
export function generateMidiFile(
  patternRows: number[][],
  noteRhythm = "4",
): Uint8Array {
  const track = new MidiWriter.Track();
  track.setTempo(120);
  const midiDuration =
    {
      "": "16",
      "2": "8",
      "4": "4",
      "8": "2",
      "16": "1",
    }[noteRhythm] ?? "4";

  patternRows.forEach((row) => {
    row.forEach((midiNote) => {
      track.addEvent(
        new MidiWriter.NoteEvent({
          pitch: [midiNote],
          duration: midiDuration,
        }),
      );
    });
  });

  const writer = new MidiWriter.Writer(track);
  return writer.buildFile();
}

/**
 * Converts a Uint8Array MIDI file buffer to a data URI string.
 */
export function uint8ArrayToDataUri(data: Uint8Array): string {
  let binary = "";
  const len = data.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(data[i]);
  }
  const base64 =
    typeof btoa === "function"
      ? btoa(binary)
      : (
          globalThis as unknown as {
            Buffer: {
              from: (
                str: string,
                encoding: string,
              ) => { toString: (encoding: string) => string };
            };
          }
        ).Buffer.from(binary, "binary").toString("base64");
  return `data:audio/midi;base64,${base64}`;
}

/**
 * Creates a filename following the pattern: originalFileName (without ext) + "-" + sanitizedPattern + ".mid"
 */
export function buildMidiFileName(
  originalFileName: string,
  patternStr: string,
): string {
  const baseName = originalFileName.replace(/\.[^/.]+$/, "");
  const sanitizedPattern = patternStr
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .join("-");

  return `${baseName}-${sanitizedPattern || "pattern"}.mid`;
}

/**
 * Triggers a browser file download of a MIDI file Uint8Array.
 */
export function downloadMidiFile(data: Uint8Array, fileName: string): void {
  const blob = new Blob([data.buffer as ArrayBuffer], { type: "audio/midi" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
