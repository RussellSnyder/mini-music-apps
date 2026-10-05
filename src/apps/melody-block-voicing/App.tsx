"use client";
import { AbcViewer } from "@/shared/AbcViewer";
import { getInitialMusicOutput, MusicInput } from "@/shared/MusicInput";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { ScaleType } from "tonal";
import { Voice, type VoiceValue } from "./components/Voice";
import { buildVoicesAbc } from "./utils/voicing";

const defaultNotes = "64, 67, 72, 71, 69, 67, 64";
const defaultAbc = `
M:4/4
L:1/8
E2 G c d2 c2 | A _A G2 F E C2 |
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

const selectClassName =
  "rounded-lg border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20";

function App() {
  const [melodyAbc, setMelodyAbc] = useState(
    () => getInitialMusicOutput(defaultNotes, defaultAbc).abcNotation,
  );
  const [root, setRoot] = useState("C");
  const [scale, setScale] = useState("major");
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
        root,
        scale,
      ),
    [melodyAbc, voices, root, scale],
  );

  const nextVoiceId = useRef(4);

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
      </div>
      <section className="flex flex-col gap-4" aria-label="Voices">
        <h2 className="text-xl font-semibold">Voices</h2>
        {voices.map((voice, index) => (
          <Voice
            key={voice.id}
            index={index}
            value={voice}
            melodyAbc={melodyAbc}
            root={root}
            scale={scale}
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
      </section>
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
