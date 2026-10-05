"use client";
import React, { useState } from "react";
import "./App.css";
import { AbcViewer } from "./components/AbcViewer";
import { HtmlMidiPlayer } from "./components/HtmlMidiPlayer";
import {
  buildMidiFileName,
  downloadMidiFile,
  generateMidiFile,
  uint8ArrayToDataUri,
} from "./utils/generateMidi";
import { generatePattern } from "./utils/generatePattern";
import {
  generateAbcNotation,
  parseMidiFileToAbc,
} from "./utils/noteConverstion";

const defaultNotes = "60, 64, 65, 67, 69, 71, 72, 74";

function App() {
  const [inputMode, setInputMode] = useState<"notes" | "file">("notes");

  // MIDI Note Text Input state
  const [midiNotesInput, setMidiNotesInput] = useState<string>(defaultNotes);
  const [submittedMidiNotes, setSubmittedMidiNotes] =
    useState<string>(defaultNotes);

  // Pattern input state
  const [patternInput, setPatternInput] = useState<string>("1, 2, 3, 4, 5");
  const [submittedPattern, setSubmittedPattern] =
    useState<string>("1, 2, 3, 4, 5");
  const [rhythm, setRhythm] = useState<string>("4");

  const [isMidiLoading, setIsMidiLoading] = useState<boolean>(false);
  const [isCrochetLoading, setIsCrochetLoading] = useState<boolean>(false);

  const [uploadedMidi, setUploadedMidi] = useState<{
    fileName: string;
    abcNotation: string;
    midiNotes: number[];
    dataUri: string;
  } | null>(null);

  const triggerCrochetGeneration = (
    newPattern: string,
    newMidiNotes?: string,
  ) => {
    setIsCrochetLoading(true);
    setTimeout(() => {
      setSubmittedPattern(newPattern);
      if (newMidiNotes !== undefined) {
        setSubmittedMidiNotes(newMidiNotes);
      }
      setIsCrochetLoading(false);
    }, 300);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsMidiLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const parsed = parseMidiFileToAbc(arrayBuffer, file.name);

      const reader = new FileReader();
      reader.onload = () => {
        const dataUri = reader.result as string;
        setUploadedMidi({
          fileName: file.name,
          abcNotation: parsed.abcNotation,
          midiNotes: parsed.midiNotes,
          dataUri,
        });
        setIsMidiLoading(false);
      };
      reader.readAsDataURL(file);

      setInputMode("file");
      if (parsed.midiNotes.length > 0) {
        triggerCrochetGeneration(patternInput);
      }
    } catch (err) {
      console.error("Failed to parse MIDI file:", err);
      setIsMidiLoading(false);
    }
  };

  // Parse MIDI notes from text input
  const parsedInputNotes = submittedMidiNotes
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => !isNaN(n));

  // Generate quarter-note MIDI file for text-input notes
  const inputMidiBytes =
    parsedInputNotes.length > 0
      ? generateMidiFile(parsedInputNotes.map((n) => [n]))
      : null;
  const inputMidiDataUri = inputMidiBytes
    ? uint8ArrayToDataUri(inputMidiBytes)
    : null;

  // Derive active pattern notes depending on active input mode
  const activeMidiNotes =
    inputMode === "notes"
      ? parsedInputNotes
      : uploadedMidi
        ? uploadedMidi.midiNotes
        : [];

  const patternOutput =
    activeMidiNotes.length > 0
      ? generatePattern(activeMidiNotes, 0, submittedPattern)
      : [];
  const abcNotation = generateAbcNotation(patternOutput, rhythm);

  return (
    <main className="app-container">
      <h1>Music Crochet</h1>

      {/* Input Mode Selector */}
      <div className="flex gap-3 mb-6 border-b border-gray-200 dark:border-gray-700 pb-3">
        <button
          type="button"
          onClick={() => setInputMode("notes")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            inputMode === "notes"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          MIDI Notes Input
        </button>
        <button
          type="button"
          onClick={() => setInputMode("file")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            inputMode === "file"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          Upload MIDI File
        </button>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="input-form">
        {inputMode === "notes" ? (
          <div className="input-group">
            <label htmlFor="midi-notes">midi notes</label>
            <input
              id="midi-notes"
              type="text"
              value={midiNotesInput}
              onChange={(e) => setMidiNotesInput(e.target.value)}
              onBlur={() =>
                triggerCrochetGeneration(patternInput, midiNotesInput)
              }
              placeholder="e.g. 60, 64, 65, 67"
            />
          </div>
        ) : (
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
            {isMidiLoading && (
              <span className="text-sm text-indigo-600 dark:text-indigo-400 animate-pulse font-medium">
                Loading MIDI file...
              </span>
            )}
            {!isMidiLoading && uploadedMidi && (
              <span className="text-sm text-gray-600 dark:text-gray-300 font-mono">
                Loaded: <strong>{uploadedMidi.fileName}</strong> (
                {uploadedMidi.midiNotes.length} notes)
              </span>
            )}
          </div>
        )}

        <div className="input-group">
          <label htmlFor="pattern">pattern</label>
          <input
            id="pattern"
            type="text"
            value={patternInput}
            onChange={(e) => setPatternInput(e.target.value)}
            onBlur={() =>
              triggerCrochetGeneration(
                patternInput,
                inputMode === "notes" ? midiNotesInput : undefined,
              )
            }
            placeholder="e.g. 1, 4, 3, 2"
          />
        </div>
      </form>

      {/* MIDI Notes Input Visualizer & Player */}
      {inputMode === "notes" && inputMidiDataUri && (
        <section className="output-container mt-8">
          <h2 className="text-xl font-semibold mb-2">
            Input MIDI Visualizer & Player (Quarter Notes)
          </h2>
          <HtmlMidiPlayer
            dataUri={inputMidiDataUri}
            fileName="input-notes.mid"
          />
        </section>
      )}

      {/* Uploaded MIDI section with loading state */}
      {inputMode === "file" && isMidiLoading && (
        <section className="output-container mt-8 p-8 bg-gray-50 dark:bg-gray-800 rounded-lg text-center shadow">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent mb-3"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">
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
        <section className="output-container mt-8 p-8 bg-gray-50 dark:bg-gray-800 rounded-lg text-center shadow">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent mb-3"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">
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
