"use client";
import { AbcViewer } from "@/shared/AbcViewer";
import { useState } from "react";
import "./App.css";
import { HtmlMidiPlayer } from "./components/HtmlMidiPlayer";
import {
  getInitialMusicOutput,
  MusicInput,
  type MusicInputOutput,
} from "@/shared/MusicInput";
import {
  buildMidiFileName,
  downloadMidiFile,
  generateMidiFile,
} from "./utils/generateMidi";
import { generatePattern } from "./utils/generatePattern";
import { generateAbcNotation } from "@/shared/utils/noteConverstion";

const defaultNotes = "60, 64, 65, 67, 69, 71, 72, 74";
const defaultAbc = `
M:4/4
L:1/16
C D E F G A B c
`;

function App() {
  const [music, setMusic] = useState<MusicInputOutput>(() =>
    getInitialMusicOutput(defaultNotes, defaultAbc),
  );

  // Pattern input state
  const [patternInput, setPatternInput] = useState<string>("1, 2, 3, 4, 5");
  const [submittedPattern, setSubmittedPattern] =
    useState<string>("1, 2, 3, 4, 5");
  const [rhythm, setRhythm] = useState<string>("4");

  const [isCrochetLoading, setIsCrochetLoading] = useState<boolean>(false);

  const triggerCrochetGeneration = (newPattern: string) => {
    setIsCrochetLoading(true);
    setTimeout(() => {
      setSubmittedPattern(newPattern);
      setIsCrochetLoading(false);
    }, 300);
  };

  const handleMusicInputChange = (next: MusicInputOutput) => {
    setMusic(next);
    // Typing in the ABC editor updates live, without the loading state
    if (next.mode !== "abc") {
      triggerCrochetGeneration(patternInput);
    }
  };

  const {
    mode: inputMode,
    uploadedMidi,
    isLoading: isMidiLoading,
    midiNotes: activeMidiNotes,
  } = music;

  const patternOutput =
    activeMidiNotes.length > 0
      ? generatePattern(activeMidiNotes, 0, submittedPattern)
      : [];
  const abcNotation = generateAbcNotation(patternOutput, rhythm);

  const patternField = (
    <div className="input-group">
      <label htmlFor="pattern">pattern</label>
      <input
        id="pattern"
        type="text"
        value={patternInput}
        onChange={(e) => setPatternInput(e.target.value)}
        onBlur={() => triggerCrochetGeneration(patternInput)}
        placeholder="e.g. 1, 4, 3, 2"
      />
    </div>
  );

  return (
    <main className="app-container">
      <h1>Sequence Stutterer</h1>

      <MusicInput
        initialNotes={defaultNotes}
        initialAbc={defaultAbc}
        onMusicInputChange={handleMusicInputChange}
      />

      <form onSubmit={(e) => e.preventDefault()} className="input-form !mt-6">
        {patternField}
      </form>

      {/* Uploaded MIDI section with loading state */}
      {inputMode === "file" && isMidiLoading && (
        <section className="output-container mt-8 p-8 bg-gray-50 rounded-lg text-center shadow">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent mb-3"></div>
          <p className="text-gray-600 font-medium">
            Rendering MIDI visualizer and player...
          </p>
        </section>
      )}

      {inputMode === "file" && !isMidiLoading && uploadedMidi && (
        <section className="output-container mt-8">
          <h2 className="text-xl font-semibold mb-2">
            Uploaded MIDI Visualizer & Player ({uploadedMidi.fileName})
          </h2>
          <HtmlMidiPlayer
            dataUri={uploadedMidi.dataUri}
            fileName={uploadedMidi.fileName}
          />
        </section>
      )}

      {/* Crocheted Music Section with loading state */}
      {isCrochetLoading && (
        <section className="output-container mt-8 p-8 bg-gray-50 rounded-lg text-center shadow">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent mb-3"></div>
          <p className="text-gray-600 font-medium">
            Generating crocheted pattern and sheet music...
          </p>
        </section>
      )}

      {!isCrochetLoading && patternOutput.length > 0 && (
        <section className="output-container mt-8">
          <h2 className="text-xl font-semibold mb-4">Crocheted Sheet Music</h2>
          <div className="input-group mb-6">
            <label htmlFor="rhythm">Rhythm</label>
            <select
              id="rhythm"
              value={rhythm}
              onChange={(e) => setRhythm(e.target.value)}
            >
              <option value="">16th Notes</option>
              <option value="2">8th Notes</option>
              <option value="4">Quarter Notes</option>
              <option value="8">Half Notes</option>
              <option value="16">Whole Notes</option>
            </select>
          </div>
          <AbcViewer abcNotation={abcNotation} />

          <div className="mt-6 flex justify-center">
            <button
              onClick={() => {
                const midiBytes = generateMidiFile(patternOutput, rhythm);
                const originalName =
                  inputMode === "file" && uploadedMidi
                    ? uploadedMidi.fileName
                    : "midi-notes.mid";
                const downloadName = buildMidiFileName(
                  originalName,
                  submittedPattern,
                );
                downloadMidiFile(midiBytes, downloadName);
              }}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg shadow transition-colors flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download Crocheted MIDI File
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

export default App;
