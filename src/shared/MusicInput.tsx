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
  meter: string;
  baseNoteLength: string;
  tempo: string;
  uploadedMidi: UploadedMidi | null;
  isLoading: boolean;
};

const inputModes = [
  { mode: "abc", label: "ABC Input" },
  { mode: "midi-notes", label: "MIDI Notes Input" },
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
  const meter = abcText.match(/^\s*M:(.+)$/m)?.[1]?.trim() ?? "4/4";
  const baseNoteLength = abcText.match(/^\s*L:(.+)$/m)?.[1]?.trim() ?? "1/16";
  const tempo = abcText.match(/^\s*Q:1\/4=(\d+)\s*$/m)?.[1] ?? "120";

  return {
    mode: "abc",
    notesText,
    committedNotesText: notesText,
    abcText,
    meter,
    baseNoteLength,
    tempo,
    uploadedMidi: null,
    isLoading: false,
  };
}

function getAbcBody(abc: string): string {
  return abc
    .split(/\r?\n/)
    .filter((line) => !/^\s*[MLQ]:/.test(line))
    .join("\n")
    .trim();
}

function addAbcHeaders(
  abc: string,
  meter: string,
  baseNoteLength: string,
  tempo: string,
): string {
  const headers = [
    meter.trim() ? `M:${meter.trim()}` : "",
    baseNoteLength.trim() ? `L:${baseNoteLength.trim()}` : "",
    tempo.trim() ? `Q:1/4=${tempo.trim()}` : "",
  ].filter(Boolean);
  const body = getAbcBody(abc);
  return [...headers, body].filter(Boolean).join("\n");
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
  let abc: string | null;
  switch (state.mode) {
    case "abc":
      abc = state.abcText;
      break;
    case "midi-notes": {
      const notes = parseNotesText(state.committedNotesText);
      abc = notes.length > 0 ? generateAbcNotation([notes]) : null;
      break;
    }
    case "file":
      abc = state.uploadedMidi?.abcNotation ?? null;
      break;
  }
  return abc === null
    ? null
    : addAbcHeaders(abc, state.meter, state.baseNoteLength, state.tempo);
}

// What the parent needs to know about the current input
export type MusicInputOutput = {
  mode: InputMode;
  midiNotes: number[];
  abcNotation: string;
  uploadedMidi: UploadedMidi | null;
  isLoading: boolean;
};

function toOutput(state: MusicInputState): MusicInputOutput {
  return {
    mode: state.mode,
    midiNotes: getMidiNotes(state),
    abcNotation: getEditorValue(state) ?? "",
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
      <div className="flex flex-col gap-2 mb-4">
        <label htmlFor="midi-notes" className="font-semibold">
          MIDI notes
        </label>
        <input
          id="midi-notes"
          type="text"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20"
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
  const editorBody = editorValue === null ? null : getAbcBody(editorValue);
  const editor =
    editorBody !== null ? (
      <ABCInputEditor
        playback
        value={editorBody}
        notationValue={editorValue ?? ""}
        onChange={(value) =>
          update({
            abcText: addAbcHeaders(
              value,
              state.meter,
              state.baseNoteLength,
              state.tempo,
            ),
            mode: "abc",
          })
        }
      />
    ) : null;

  return (
    <div className="p-8 rounded-2xl bg-stone-200">
      <div
        role="group"
        aria-label="Input mode"
        className="mb-8 inline-flex rounded-lg shadow-sm"
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
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Meter (M:)
            <input
              type="text"
              value={state.meter}
              onChange={(e) => update({ meter: e.target.value })}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 font-normal text-zinc-900 outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20"
              placeholder="4/4"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Base Note Length (L:)
            <input
              type="text"
              value={state.baseNoteLength}
              onChange={(e) => update({ baseNoteLength: e.target.value })}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 font-normal text-zinc-900 outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20"
              placeholder="1/16"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Tempo (Q:1/4=)
            <input
              type="number"
              min="1"
              value={state.tempo}
              onChange={(e) => update({ tempo: e.target.value })}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 font-normal text-zinc-900 outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20"
              placeholder="120"
            />
          </label>
        </div>
        {editor}
      </form>
    </div>
  );
}
