import ABCJS from "abcjs";
import { useCallback, useEffect, useRef } from "react";
import { Chord, Note, Range, Scale } from "tonal";
import { noteNameToAbc, tonal_getNoteAndOctave } from "../utils/abc-notation";

function playMidiNotes(midiValues) {
  const validMidiValues = (midiValues || []).filter(
    (value) => typeof value === "number" && Number.isFinite(value),
  );

  if (validMidiValues.length === 0) {
    return;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return;
  }

  const audioContext = new AudioContextClass();
  const startTime = audioContext.currentTime;

  validMidiValues.forEach((midiValue, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const noteStart = startTime + index * 0.02;
    const frequency = 440 * 2 ** ((midiValue - 69) / 12);

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(frequency, noteStart);

    gainNode.gain.setValueAtTime(0.0001, noteStart);
    gainNode.gain.exponentialRampToValueAtTime(0.18, noteStart + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.8);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(noteStart);
    oscillator.stop(noteStart + 0.85);
  });
}

function TonalSystem({
  system,
  root = "C4",
  clefValue = "treble",
  numberOfNotesInChord,
  octaveShift = 0,
}) {
  const sectionRef = useRef(null);
  const selectedChordIndexRef = useRef(-1);
  const visualObjRef = useRef(null);
  const highlightedElementsRef = useRef([]);
  const { note } = tonal_getNoteAndOctave(root);

  const tonal_scale = Scale.get(`${root} ${system.scale}`).notes;

  const tonal_chords = tonal_scale.map((note, i) =>
    Range.numeric([0, numberOfNotesInChord - 1]).map(
      Chord.steps(system.chordQualities[i].value, note),
    ),
  );

  const chordEntries = tonal_scale.flatMap((note, i) => {
    const tonalChord = tonal_chords[i];
    const chord = tonalChord.map(noteNameToAbc).map((note) => `${note}4`);
    const symbol =
      numberOfNotesInChord === 3
        ? system.triadQualities[i]
        : system.chordQualities[i].label;
    const entries = [
      {
        notation: `"${tonal_getNoteAndOctave(tonal_scale[i]).note}${symbol}" [${chord.join(" ")}]`,
        midiValues: tonalChord.map((chordNote) =>
          Note.midi(/\d/.test(chordNote) ? chordNote : `${chordNote}4`),
        ),
      },
    ];

    if (numberOfNotesInChord === 3) {
      return entries;
    }

    const extraChords = (system.extraChords ?? [])
      .filter((extraChord) => extraChord.afterDegree === i)
      .map((extraChord) => {
        const intervalsInRelationToRoot =
          extraChord.intervalsInRelationToRoot ?? [];
        const tonal_extraChordNotes = intervalsInRelationToRoot.map(
          (interval) => Note.transpose(root, interval),
        );
        const abc_extraChordNotes = (tonal_extraChordNotes ?? [])
          .map(noteNameToAbc)
          .map((note) => `${note}`);

        const { note: extraNoteRoot } = tonal_getNoteAndOctave(
          tonal_extraChordNotes[0],
        );

        const label = `${extraNoteRoot}${extraChord.quality}`;
        const displayedLabel = extraChord.parenthesized ? `(${label})` : label;
        const symbolText =
          extraChord.showSymbol === false ? "" : `"${displayedLabel}" `;

        return {
          notation: `${symbolText}[${abc_extraChordNotes.join(" ")}]`,
          midiValues: tonal_extraChordNotes.map((extraNote) =>
            Note.midi(extraNote),
          ),
        };
      });

    return [...entries, ...extraChords];
  });

  const abc_chordString = chordEntries
    .map(({ notation }) => notation)
    .join(" ");
  const chordMidiValues = chordEntries.map(({ midiValues }) => midiValues);
  const abcPrefix = `X:${system.abcId}\nV:1 clef=${clefValue}\nL:1/4\n`;
  const chordRanges = chordEntries.reduce((ranges, entry, index) => {
    const previousEnd = ranges[index - 1]?.end ?? abcPrefix.length;
    const start = index === 0 ? abcPrefix.length : previousEnd + 1;

    return [...ranges, { start, end: start + entry.notation.length }];
  }, []);

  const highlightChord = useCallback(
    (index) => {
      const engraver = visualObjRef.current?.[0]?.engraver;
      const range = chordRanges[index];
      const highlightColor = "#ffcc00";
      const normalColor = "#000";

      highlightedElementsRef.current.forEach((element) =>
        element.unhighlight("tonal-system-chord-selected", normalColor),
      );
      highlightedElementsRef.current = [];

      if (!engraver || !range || index < 0) {
        return;
      }

      highlightedElementsRef.current = (engraver.selectables || [])
        .filter((selectable) => {
          const startChar = selectable.absEl?.abcelem?.startChar;
          return (
            Number.isFinite(startChar) &&
            startChar >= range.start &&
            startChar <= range.end
          );
        })
        .map((selectable) => selectable.absEl)
        .filter(Boolean);

      highlightedElementsRef.current.forEach((element) =>
        element.highlight("tonal-system-chord-selected", highlightColor),
      );
    },
    [chordRanges],
  );

  const handleKeyDown = (event) => {
    if (event.key === " ") {
      event.preventDefault();
      const selectedIndex = selectedChordIndexRef.current;
      if (selectedIndex < 0) {
        return;
      }
      playMidiNotes(chordMidiValues[selectedIndex]);
      window.setTimeout(() => highlightChord(selectedIndex), 0);
      return;
    }

    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }

    const currentIndex = selectedChordIndexRef.current;
    if (currentIndex < 0) {
      return;
    }

    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = currentIndex + direction;

    if (nextIndex < 0 || nextIndex >= chordMidiValues.length) {
      return;
    }

    selectedChordIndexRef.current = nextIndex;
    highlightChord(nextIndex);
  };

  useEffect(() => {
    selectedChordIndexRef.current = -1;
    highlightChord(-1);
  }, [highlightChord, numberOfNotesInChord, root, system]);

  useEffect(() => {
    const visualObj = ABCJS.renderAbc(
      system.id,
      `${abcPrefix}${abc_chordString} ||`,
      {
        responsive: "resize",
        clickListener: (abcElem) => {
          if (!abcElem || abcElem.el_type !== "note") {
            return;
          }

          const clickedIndex = chordRanges.findIndex(
            ({ start, end }) =>
              abcElem.startChar >= start && abcElem.startChar <= end,
          );

          if (clickedIndex >= 0) {
            selectedChordIndexRef.current = clickedIndex;
            highlightChord(clickedIndex);
            window.setTimeout(() => highlightChord(clickedIndex), 0);
          }
        },
      },
    );
    visualObjRef.current = visualObj;
    visualObj[0].setUpAudio();
    highlightChord(-1);
  }, [
    abcPrefix,
    abc_chordString,
    chordRanges,
    clefValue,
    highlightChord,
    octaveShift,
    root,
    system,
  ]);

  return (
    <section
      ref={sectionRef}
      className="tonal-system"
      aria-label={`${root} ${system.ariaLabel}`}
      tabIndex="0"
      onClick={() => sectionRef.current?.focus()}
      onKeyDown={handleKeyDown}
    >
      <h2 className="tonal-system-title">
        {note} {system.title}
      </h2>
      <div id={system.id} />
    </section>
  );
}

export default TonalSystem;
