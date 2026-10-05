import { useState } from "react";
import { createMidiFromChords } from "../utils/createMidiFromChords";
import { getChordsBetween } from "../utils/getChordsBetween";
import AbcChordView from "./AbcChordView";
import ChordInput from "./ChordInput";

function InputWrapper() {
  const [startChord, setStartChord] = useState("B3, C4, D4, F#4, B4, D5");
  const [endChord, setEndChord] = useState("C2, G2, D3, A4, G5, A6");
  const [numberOfSteps, setNumberOfSteps] = useState(1);
  const startNotes = startChord
    .split(",")
    .map((note) => note.trim())
    .filter(Boolean);
  const endNotes = endChord
    .split(",")
    .map((note) => note.trim())
    .filter(Boolean);
  const chords = [
    startNotes,
    ...getChordsBetween(startNotes, endNotes, numberOfSteps),
    endNotes,
  ];

  const downloadMidi = () => {
    const midiWriter = createMidiFromChords(chords);
    const downloadLink = document.createElement("a");

    downloadLink.href = midiWriter.dataUri();
    downloadLink.download = "chord-differentiator.mid";
    downloadLink.click();
  };

  return (
    <main className="note-panel">
      <p className="eyebrow">Chord Diff</p>
      <h1>Chords Between</h1>
      <p className="description text-center">
        Enter note values separated by commas to define the sequence you want to
        work with.
      </p>

      <div className="grid grid-cols-2 gap-x-16 gap-y-4 mb-10">
        <ChordInput
          id="start-chord"
          label="StartChord"
          value={startChord}
          onChange={setStartChord}
        />
        <ChordInput
          id="end-chord"
          label="End Chord"
          value={endChord}
          onChange={setEndChord}
        />
        <div className="">
          <label htmlFor="number-of-steps">number of steps</label>
          <input
            id="number-of-steps"
            type="number"
            min="1"
            step="1"
            value={numberOfSteps}
            onChange={(event) => {
              const value = event.currentTarget.valueAsNumber;

              setNumberOfSteps(Number.isNaN(value) ? 1 : value);
            }}
          />
        </div>
      </div>

      <AbcChordView
        startNotes={startNotes}
        endNotes={endNotes}
        numberOfSteps={numberOfSteps}
      />

      <button type="button" className="download-midi" onClick={downloadMidi}>
        download midi
      </button>
    </main>
  );
}

export default InputWrapper;
