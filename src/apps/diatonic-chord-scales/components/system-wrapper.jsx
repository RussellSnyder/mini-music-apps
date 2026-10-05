import { useState } from "react";
import {
  CHORD_SCALES,
  SUPPORTED_ROOTS,
  TONAL_SYSTEMS,
} from "../data/tonal-systems";
import ChordScaleComponent from "./chord-scale-component";
import TonalSystem from "./tonal-system";

const CLEFS = [
  { value: "treble", label: "Treble" },
  { value: "bass", label: "Bass" },
  { value: "alto", label: "Alto" },
];

const NUMBER_OF_NOTES_IN_CHORD = [
  { value: 4, label: "Seventh Chords (4 notes)" },
  { value: 3, label: "Triads (3 notes)" },
];

function SystemWrapper() {
  const [selectedRoot, setSelectedRoot] = useState(SUPPORTED_ROOTS[24]);
  const [selectedClef, setSelectedClef] = useState(CLEFS[0].value);
  const [selectedNumberOfNotesInChord, setSelectedNumberOfNotesInChord] =
    useState(NUMBER_OF_NOTES_IN_CHORD[0].value);

  return (
    <>
      <section
        className="system-controls"
        aria-labelledby="system-controls-title"
      >
        <div>
          <label htmlFor="root-select">Root</label>
          <select
            id="root-select"
            value={selectedRoot}
            onChange={(event) => setSelectedRoot(event.target.value)}
          >
            {SUPPORTED_ROOTS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="clef-select">Clef</label>
          <select
            id="clef-select"
            value={selectedClef}
            onChange={(event) => setSelectedClef(event.target.value)}
          >
            {CLEFS.map((clef) => (
              <option key={clef.value} value={clef.value}>
                {clef.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="number-of-notes-select">Number of Notes</label>
          <select
            id="number-of-notes-select"
            value={selectedNumberOfNotesInChord}
            onChange={(event) =>
              setSelectedNumberOfNotesInChord(event.target.value)
            }
          >
            {NUMBER_OF_NOTES_IN_CHORD.map((chordType) => (
              <option key={chordType.value} value={chordType.value}>
                {chordType.label}
              </option>
            ))}
          </select>
        </div>
      </section>
      {TONAL_SYSTEMS.map((system) => (
        <TonalSystem
          key={system.id}
          system={system}
          root={selectedRoot}
          clefValue={selectedClef}
          numberOfNotesInChord={Number(selectedNumberOfNotesInChord)}
        />
      ))}
      <div className="chord-scale-page">
        {CHORD_SCALES.map((chordScale) => (
          <ChordScaleComponent
            key={chordScale.name}
            chord={chordScale.chord}
            scales={chordScale.scales}
            name={chordScale.name}
            root={selectedRoot}
            clefValue={selectedClef}
          />
        ))}
      </div>
    </>
  );
}

export default SystemWrapper;
