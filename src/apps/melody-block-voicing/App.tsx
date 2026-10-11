"use client";
import { AbcViewer } from "@/shared/AbcViewer";
import { getInitialMusicOutput, MusicInput } from "@/shared/MusicInput";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Scale, ScaleType } from "tonal";
import { Voice, type VoiceValue } from "./components/Voice";
import { buildVoicesAbc, type NonScaleToneResolution } from "./utils/voicing";

const defaultNotes = "64, 67, 72, 71, 69, 67, 64";
const defaultAbc = `
M:4/4
L:1/8
Q:1/4=120
E2 G c d _d c2 | A _A G2 F E C2 |
`;

const ROOTS = [
  "C",
  "C#",
  "Db",
  "D",
  "D#",
  "Eb",
  "E",
  "F",
  "F#",
  "Gb",
  "G",
  "G#",
  "Ab",
  "A",
  "A#",
  "Bb",
  "B",
];
const SCALES = ScaleType.names();
const NON_SCALE_TONE_OPTIONS = [
  { value: "chromatic-approach", label: "Chromatic Approach" },
  { value: "repeat-last-note", label: "Repeat last note" },
] as const;

const ARTISTS = ["Basie", "Nestico", "Ellington"] as const;

const selectClassName =
  "rounded-lg border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20";

function App() {
  const [melodyAbc, setMelodyAbc] = useState(
    () => getInitialMusicOutput(defaultNotes, defaultAbc).abcNotation,
  );
  const [root, setRoot] = useState("C");
  const [scale, setScale] = useState("major");
  const [scaleNotes, setScaleNotes] = useState(() =>
    Scale.get("C major").notes.join(" "),
  );
  const [nonScaleToneResolution, setNonScaleToneResolution] =
    useState<NonScaleToneResolution>(NON_SCALE_TONE_OPTIONS[0].value);
  const [voices, setVoices] = useState<VoiceValue[]>([
    { id: "1", stepsBelow: 2 },
    { id: "2", stepsBelow: 4 },
    { id: "3", stepsBelow: 6 },
  ]);

  const voicesAbc = useMemo(
    () =>
      buildVoicesAbc(
        melodyAbc,
        voices.map((v) => v.stepsBelow),
        scaleNotes,
        nonScaleToneResolution,
      ),
    [melodyAbc, voices, scaleNotes, nonScaleToneResolution],
  );

  const generateScale = () =>
    setScaleNotes(Scale.get(`${root} ${scale}`).notes.join(" "));

  const nextVoiceId = useRef(4);

  const [presetMode, setPresetMode] = useState<"artist" | "manual">("artist");
  const [artist, setArtist] = useState<(typeof ARTISTS)[number]>(ARTISTS[0]);
  const [voiceCount, setVoiceCount] = useState(3);
  const [voiceSpacing, setVoiceSpacing] = useState(2);

  const generateVoices = () =>
    setVoices(
      Array.from({ length: Math.max(0, voiceCount) }, (_, i) => ({
        id: String(nextVoiceId.current++),
        stepsBelow: (i + 1) * voiceSpacing,
      })),
    );

  const addVoice = () =>
    setVoices((current) => [
      ...current,
      {
        id: String(nextVoiceId.current++),
        stepsBelow: (current.at(-1)?.stepsBelow ?? 0) + 2,
      },
    ]);

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 p-8">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        Mini Music Apps
      </Link>
      <h1 className="text-3xl font-semibold">Melody Block Voicing</h1>
      <p className="text-zinc-600">
        Harmonize a melody in four-way close block voicing, with the baritone
        doubling the lead, as in a big band sax soli.
      </p>
      <MusicInput
        initialNotes={defaultNotes}
        initialAbc={defaultAbc}
        onMusicInputChange={(output) => setMelodyAbc(output.abcNotation)}
      />
      <div className="flex flex-col gap-6 sm:flex-row [&>*]:flex-1">
        <div className="flex flex-col gap-2">
          <label htmlFor="root" className="font-semibold">
            Root
          </label>
          <select
            id="root"
            value={root}
            onChange={(e) => setRoot(e.target.value)}
            className={selectClassName}
          >
            {ROOTS.map((note) => (
              <option key={note} value={note}>
                {note}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="scale" className="font-semibold">
            Scale
          </label>
          <select
            id="scale"
            value={scale}
            onChange={(e) => setScale(e.target.value)}
            className={selectClassName}
          >
            {SCALES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={generateScale}
          className="self-end rounded-lg bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
        >
          Generate scale
        </button>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="scale-notes" className="font-semibold">
          Scale notes
        </label>
        <input
          id="scale-notes"
          type="text"
          value={scaleNotes}
          onChange={(e) => setScaleNotes(e.target.value)}
          placeholder="C D E F G A B"
          className={selectClassName}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="non-scale-tone" className="font-semibold">
          How to resolve none scale tones
        </label>
        <select
          id="non-scale-tone"
          value={nonScaleToneResolution}
          onChange={(e) =>
            setNonScaleToneResolution(e.target.value as NonScaleToneResolution)
          }
          className={selectClassName}
        >
          {NON_SCALE_TONE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <details className="group flex flex-col gap-4" open>
        <summary className="flex cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden">
          <span
            aria-hidden="true"
            className="text-zinc-500 transition-transform group-open:rotate-90"
          >
            ▶
          </span>
          <h2 className="text-xl font-semibold">Voices</h2>
        </summary>
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-4">
            <h3 className="text-lg font-semibold">Presets</h3>
            <div className="inline-flex self-start overflow-hidden rounded-lg border border-zinc-300">
              {(
                [
                  ["manual", "Manual presets"],
                  ["artist", "Artist presets"],
                ] as const
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={presetMode === mode}
                  onClick={() => setPresetMode(mode)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    presetMode === mode
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {presetMode === "artist" ? (
              <div className="flex flex-col gap-2">
                COMING SOON
                <label htmlFor="artist" className="font-semibold">
                  Artist
                </label>
                <select
                  disabled
                  id="artist"
                  value={artist}
                  onChange={(e) =>
                    setArtist(e.target.value as (typeof ARTISTS)[number])
                  }
                  className={selectClassName}
                >
                  {ARTISTS.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end [&>div]:flex-1">
                <div className="flex flex-col gap-2">
                  <label htmlFor="voice-count" className="font-semibold">
                    Number of voices
                  </label>
                  <input
                    id="voice-count"
                    type="number"
                    min={1}
                    value={voiceCount}
                    onChange={(e) => setVoiceCount(Number(e.target.value))}
                    className={selectClassName}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="voice-spacing" className="font-semibold">
                    Space between voices
                  </label>
                  <input
                    id="voice-spacing"
                    type="number"
                    min={1}
                    value={voiceSpacing}
                    onChange={(e) => setVoiceSpacing(Number(e.target.value))}
                    className={selectClassName}
                  />
                </div>
                <button
                  type="button"
                  onClick={generateVoices}
                  className="rounded-lg bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
                >
                  Generate voices
                </button>
              </div>
            )}
          </div>
          {voices.map((voice, index) => (
            <Voice
              key={voice.id}
              index={index}
              value={voice}
              melodyAbc={melodyAbc}
              scaleNotes={scaleNotes}
              nonScaleToneResolution={nonScaleToneResolution}
              onChange={(next) =>
                setVoices((current) =>
                  current.map((v) => (v.id === voice.id ? next : v)),
                )
              }
              onRemove={() =>
                setVoices((current) => current.filter((v) => v.id !== voice.id))
              }
            />
          ))}
          <button
            type="button"
            onClick={addVoice}
            className="self-start rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            Add voice
          </button>
        </div>
      </details>
      {voicesAbc && (
        <section className="flex flex-col gap-4" aria-label="Voicing">
          <h2 className="text-xl font-semibold">Voicing</h2>
          <AbcViewer abcNotation={voicesAbc} />
        </section>
      )}
    </div>
  );
}

export default App;
