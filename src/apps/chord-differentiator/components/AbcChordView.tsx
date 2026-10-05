import * as ABCJS from "abcjs";
import { useEffect, useRef } from "react";
import { getChordsBetween } from "../utils/getChordsBetween";
import { noteNameToAbc, noteNameToMidi } from "../utils/noteUtils";

type AbcChordViewProps = {
  startNotes: string[];
  endNotes: string[];
  numberOfSteps: number;
};

function toAbcChord(notes: string[], bass: boolean): string {
  const abcNotes = notes
    .filter((note) => {
      const midiValue = noteNameToMidi(note);

      return midiValue !== null && (bass ? midiValue < 60 : midiValue >= 60);
    })
    .map(noteNameToAbc)
    .filter((note): note is string => note !== null);

  return abcNotes.length > 0 ? `[${abcNotes.join("")}]2` : "z2";
}

function toAbcVoice(chords: string[][], bass: boolean): string {
  return `${chords.map((chord) => toAbcChord(chord, bass)).join(" | ")} |`;
}

function AbcChordView({
  startNotes,
  endNotes,
  numberOfSteps,
}: AbcChordViewProps) {
  const notationRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<InstanceType<typeof ABCJS.synth.CreateSynth> | null>(
    null,
  );
  const visualObjectRef = useRef<
    ReturnType<typeof ABCJS.renderAbc>[number] | null
  >(null);

  useEffect(() => {
    if (!notationRef.current) {
      return;
    }

    notationRef.current.replaceChildren();
    const chords = [
      startNotes,
      ...getChordsBetween(startNotes, endNotes, numberOfSteps),
      endNotes,
    ];
    const notationWidth = Math.max(320, chords.length * 180);

    notationRef.current.style.width = `${notationWidth}px`;
    const abc = [
      "X:1",
      "M:2/4",
      "L:1/4",
      "K:C",
      "%%staves { RH LH }",
      "V:RH clef=treble",
      "V:LH clef=bass",
      `[V:RH] ${toAbcVoice(chords, false)}`,
      `[V:LH] ${toAbcVoice(chords, true)}`,
    ].join("\n");

    const visualObjects = ABCJS.renderAbc(notationRef.current, abc, {
      responsive: "resize",
      staffwidth: notationWidth,
    });

    visualObjectRef.current = visualObjects[0];
  }, [startNotes, endNotes, numberOfSteps]);

  const playChordSequence = async () => {
    if (!visualObjectRef.current) {
      return;
    }

    synthRef.current?.stop();
    const synth = new ABCJS.synth.CreateSynth();

    await synth.init({ visualObj: visualObjectRef.current });
    await synth.prime();
    synth.start();
    synthRef.current = synth;
  };

  return (
    <section className="p-8 abc-view" aria-label="ABC notation preview">
      <button type="button" className="play-abc" onClick={playChordSequence}>
        play
      </button>
      <div ref={notationRef} />
    </section>
  );
}

export default AbcChordView;
