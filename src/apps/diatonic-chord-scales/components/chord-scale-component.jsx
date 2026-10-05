import ABCJS from "abcjs";
import { useCallback, useEffect, useRef } from "react";
import { Chord, Note, Scale } from "tonal";
import {
  abcNoteToName,
  noteNameToAbc,
  tonal_getNoteAndOctave,
} from "../utils/abc-notation";

function playMidiNotes(midiValues, noteSpacing = 0.02, noteDuration = 0.85) {
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
    const noteStart = startTime + index * noteSpacing;
    const frequency = 440 * 2 ** ((midiValue - 69) / 12);

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(frequency, noteStart);
    gainNode.gain.setValueAtTime(0.0001, noteStart);
    gainNode.gain.exponentialRampToValueAtTime(0.18, noteStart + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(
      0.0001,
      noteStart + noteDuration,
    );
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start(noteStart);
    oscillator.stop(noteStart + noteDuration + 0.05);
  });
}

function getAbcChordNotation(root, chord, scales, clefValue) {
  const { note } = tonal_getNoteAndOctave(root);

  const tonal_scales = scales.map(({ name, distanceFromRoot }) => {
    const scaleRoot = Note.transpose(root, distanceFromRoot);
    const scale = Scale.get(`${scaleRoot} ${name}`).notes;
    const range = Scale.rangeOf(scale);
    const topRange = Note.transpose(root, "P8");

    return range(root, topRange);
  });

  const abc_scales = tonal_scales.map((scale) => scale.map(noteNameToAbc));

  const tonal_firstChord = Chord.notes(chord, root);
  const abc_firstChord = tonal_firstChord.map(noteNameToAbc);

  const firstChord = `"${note}${chord}" [${abc_firstChord.join(" ")}]`;

  const entries = [
    {
      notation: `${firstChord}`,
      isScale: false,
      midiValues: tonal_firstChord.map((noteName) =>
        Note.midi(/\d/.test(noteName) ? noteName : `${noteName}4`),
      ),
    },
  ];

  scales.forEach((scale, index) => {
    const abcNote = Note.transpose(
      abc_scales[index][0],
      scale.distanceFromRoot,
    );
    let addBreak = false;
    if (scales.length === 6 && index === 2) {
      addBreak = true;
    }
    if (scales.length === 8 && index === 3) {
      addBreak = true;
    }
    entries.push({
      notation: `"^${abcNoteToName(abcNote)} ${scale.name}" ${abc_scales[index].join(" ")}${addBreak ? "\n" : ""}`,
      isScale: true,
      midiValues: tonal_scales[index].map((noteName) =>
        Note.midi(/\d/.test(noteName) ? noteName : `${noteName}4`),
      ),
    });
  });

  return {
    entries,
    notation: [
      "X:1",
      "L:4/4",
      `V:1 clef=${clefValue}`,
      `${entries.map(({ notation }) => notation).join(" | ")} |`,
    ].join("\n"),
  };
}

function ChordScaleComponent({
  name = "yolo",
  chord = "major seventh",
  scales = [],
  root = "C",
  clefValue = "treble",
}) {
  const staffRef = useRef(null);
  const selectedEntryIndexRef = useRef(0);
  const visualObjRef = useRef(null);
  const highlightedElementsRef = useRef([]);
  const { note } = tonal_getNoteAndOctave(root);
  const abcData = getAbcChordNotation(root, chord, scales, clefValue);
  const abcPrefix = `X:1\nL:4/4\nV:1 clef=${clefValue}\n`;
  const entryRanges = abcData.entries.reduce((ranges, entry, index) => {
    const previousEnd = ranges[index - 1]?.end ?? abcPrefix.length;
    const start = index === 0 ? abcPrefix.length : previousEnd + 3;

    return [...ranges, { start, end: start + entry.notation.length }];
  }, []);

  const highlightEntry = useCallback(
    (index) => {
      const engraver = visualObjRef.current?.[0]?.engraver;
      const range = entryRanges[index];
      if (!engraver || !range) {
        return;
      }

      const isDarkMode = document.documentElement.dataset.theme === "dark";
      const highlightColor = isDarkMode ? "#ffbfa1" : "#ffcc00";
      const normalColor = isDarkMode ? "#fff" : "#000";

      highlightedElementsRef.current.forEach((element) =>
        element.unhighlight("chord-scale-entry-selected", normalColor),
      );

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
        element.highlight("chord-scale-entry-selected", highlightColor),
      );
    },
    [entryRanges],
  );

  const handleKeyDown = (event) => {
    if (event.key === " ") {
      event.preventDefault();
      const selectedIndex = selectedEntryIndexRef.current;
      const selectedEntry = abcData.entries[selectedIndex];
      playMidiNotes(
        selectedEntry?.midiValues,
        selectedEntry?.isScale ? 0.2 : 0.02,
        selectedEntry?.isScale ? 0.6 : 0.85,
      );
      window.setTimeout(() => highlightEntry(selectedIndex), 0);
      return;
    }

    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }

    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = selectedEntryIndexRef.current + direction;
    if (nextIndex < 0 || nextIndex >= abcData.entries.length) {
      return;
    }

    selectedEntryIndexRef.current = nextIndex;
    highlightEntry(nextIndex);
  };

  useEffect(() => {
    if (!staffRef.current) {
      return;
    }

    const visualObj = ABCJS.renderAbc(staffRef.current, abcData.notation, {
      responsive: "resize",
      clickListener: (abcElem) => {
        const clickedIndex = entryRanges.findIndex(
          ({ start, end }) =>
            abcElem.startChar >= start && abcElem.startChar <= end,
        );

        if (clickedIndex >= 0) {
          selectedEntryIndexRef.current = clickedIndex;
          highlightEntry(clickedIndex);
        }
      },
    });
    visualObjRef.current = visualObj;
    selectedEntryIndexRef.current = 0;
    highlightEntry(selectedEntryIndexRef.current);
  }, [abcData, clefValue, chord, entryRanges, highlightEntry, root, scales]);

  return (
    <section
      className="chord-scale-component"
      aria-label={`Chord and scales for ${root}`}
      tabIndex="0"
      onClick={() => staffRef.current?.parentElement?.focus()}
      onKeyDown={handleKeyDown}
    >
      <h2 className="tonal-system-title">
        {note} {name}
      </h2>
      <div ref={staffRef} className="abcjs-notation" />
    </section>
  );
}

export default ChordScaleComponent;
