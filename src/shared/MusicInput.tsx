"use client";
import { useRef, useState, type ChangeEvent } from "react";
import { ABCInputEditor } from "./ABCInputEditor";
import {
  generateAbcNotation,
  parseMidiFileToAbc,
} from "./utils/noteConverstion";

export type InputMode = "midi-notes" | "abc" | "file";

export type UploadedMidi = {
  fileName: string;
  abcNotation: string;
  midiNotes: number[];
  dataUri: string;
};

type MusicInputState = {
  mode: InputMode;
  notesText: string;
  committedNotesText: string;
  abcText: string;
  uploadedMidi: UploadedMidi | null;
  isLoading: boolean;
};

const inputModes = [
  { mode: "midi-notes", label: "MIDI Notes Input" },
  { mode: "abc", label: "ABC Input" },
  { mode: "file", label: "Upload MIDI File" },
] as const;

const pitchClasses: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

function createMusicInputState(
  notesText: string,
  abcText: string,
): MusicInputState {
  return {
    mode: "midi-notes",
    notesText,
    committedNotesText: notesText,
    abcText,
    uploadedMidi: null,
    isLoading: false,
  };
}

export function parseNotesText(text: string): number[] {
  return text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => !isNaN(n));
}

export function parseAbcToMidiNotes(abc: string): number[] {
  const body = abc
    .split(/\r?\n/)
    .filter((line) => !/^\s*[A-Za-z]:/.test(line) && !/^\s*%/.test(line))
    .join(" ");
  const notes: number[] = [];
  const notePattern = /(\^{1,2}|_{1,2}|=)?([A-Ga-g])([,']*)/g;
  let match: RegExpExecArray | null;
  while ((match = notePattern.exec(body)) !== null) {
    const [, accidental = "", letter, octaveMarks] = match;
    const octave = letter === letter.toLowerCase() ? 5 : 4;
    const octaveOffset = [...octaveMarks].reduce(
      (offset, mark) => offset + (mark === "'" ? 12 : -12),
      0,
    );
    const accidentalOffset = accidental.startsWith("^")
      ? accidental.length
      : accidental.startsWith("_")
        ? -accidental.length
        : 0;
    notes.push(
      (octave + 1) * 12 +
        pitchClasses[letter.toUpperCase()] +
        octaveOffset +
        accidentalOffset,
    );
  }
  return notes;
}

// MIDI notes described by the active input mode
function getMidiNotes(state: MusicInputState): number[] {
  switch (state.mode) {
    case "midi-notes":
      return parseNotesText(state.committedNotesText);
    case "abc":
      return parseAbcToMidiNotes(state.abcText);
    case "file":
      return state.uploadedMidi?.midiNotes ?? [];
  }
}

// Notes and uploaded files are shown as editable ABC
function getEditorValue(state: MusicInputState): string | null {
  switch (state.mode) {
    case "abc":
      return state.abcText;
    case "midi-notes": {
      const notes = parseNotesText(state.committedNotesText);
      return notes.length > 0 ? generateAbcNotation([notes]) : null;
    }
    case "file":
      return state.uploadedMidi?.abcNotation ?? null;
  }
}

// What the parent needs to know about the current input
export type MusicInputOutput = {
  mode: InputMode;
  midiNotes: number[];
  uploadedMidi: UploadedMidi | null;
  isLoading: boolean;
};

function toOutput(state: MusicInputState): MusicInputOutput {
  return {
    mode: state.mode,
    midiNotes: getMidiNotes(state),
    uploadedMidi: state.uploadedMidi,
    isLoading: state.isLoading,
  };
}

export function getInitialMusicOutput(
  notesText: string,
  abcText: string,
): MusicInputOutput {
  return toOutput(createMusicInputState(notesText, abcText));
}

type MusicInputProps = {
  initialNotes: string;
  initialAbc: string;
  onMusicInputChange: (output: MusicInputOutput) => void;
};

export function MusicInput({
  initialNotes,
  initialAbc,
  onMusicInputChange: onChange,
}: MusicInputProps) {
  const [state, setState] = useState(() =>
    createMusicInputState(initialNotes, initialAbc),
  );
  // Async upload handlers must merge into the latest state, not a stale closure
  const latestState = useRef(state);

  const update = (patch: Partial<MusicInputState>) => {
    const next = { ...latestState.current, ...patch };
    latestState.current = next;
    setState(next);
    onChange(toOutput(next));
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    update({ isLoading: true });

    try {
      const parsed = parseMidiFileToAbc(await file.arrayBuffer(), file.name);
      const reader = new FileReader();
      reader.onload = () => {
        update({
          mode: "file",
          isLoading: false,
          uploadedMidi: {
            fileName: file.name,
            abcNotation: parsed.abcNotation,
            midiNotes: parsed.midiNotes,
            dataUri: reader.result as string,
          },
        });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Failed to parse MIDI file:", err);
      update({ isLoading: false });
    }
  };

  const modeInput =
    state.mode === "midi-notes" ? (
      <div className="input-group">
        <label htmlFor="midi-notes">midi notes</label>
        <input
          id="midi-notes"
          type="text"
          value={state.notesText}
          onChange={(e) => update({ notesText: e.target.value })}
          onBlur={() => update({ committedNotesText: state.notesText })}
          placeholder="e.g. 60, 64, 65, 67"
        />
      </div>
    ) : state.mode === "file" ? (
      <div className="flex items-center gap-4 mb-2">
        <label className="cursor-pointer px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors inline-block">
          Upload MIDI File
          <input
            type="file"
            accept=".mid,.midi"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
        {state.isLoading && (
          <span className="text-sm text-indigo-600 animate-pulse font-medium">
            Loading MIDI file...
          </span>
        )}
        {!state.isLoading && state.uploadedMidi && (
          <span className="text-sm text-gray-600 font-mono">
            Loaded: <strong>{state.uploadedMidi.fileName}</strong> (
            {state.uploadedMidi.midiNotes.length} notes)
          </span>
        )}
      </div>
    ) : null;

  const editorValue = getEditorValue(state);
  const editor =
    editorValue !== null ? (
      <ABCInputEditor
        playback
        value={editorValue}
        onChange={(value) => update({ abcText: value, mode: "abc" })}
      />
    ) : null;

  return (
    <div className="px-8 py-4 rounded-2xl bg-stone-200">
      <div
        role="group"
        aria-label="Input mode"
        className="mb-2 inline-flex rounded-lg shadow-sm"
      >
        {inputModes.map(({ mode, label }) => (
          <button
            key={mode}
            type="button"
            aria-pressed={state.mode === mode}
            onClick={() => update({ mode })}
            className={`px-4 py-2 text-sm font-medium border border-gray-300 -ml-px first:ml-0 first:rounded-l-lg last:rounded-r-lg transition-colors focus:z-10 ${
              state.mode === mode
                ? "bg-indigo-600 border-indigo-600 text-white z-10"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="input-form">
        {modeInput}
        {editor}
      </form>
    </div>
  );
}
