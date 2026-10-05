import { translateToNoteNames } from "@/apps/kaprekar-sequencer/utils/musicConverter";

type SequenceListProps = {
  values: Array<number | string>;
};

export function SequenceList({ values }: SequenceListProps) {
  if (values.length === 0) {
    return <p className="sequence-empty">Enter a valid starting sequence.</p>;
  }

  const convertToMusicNotation = values.map((value) =>
    translateToNoteNames(value),
  );

  return (
    <div className="sequence-result">
      <h2>Sequence</h2>
      <div className="grid grid-cols-2 gap-5">
        <ul className="sequence-list" aria-live="polite">
          {values.map((entry, index) => (
            <li key={`${String(entry)}-${index}`} className="sequence-badge">
              {String(entry)}
            </li>
          ))}
        </ul>
        <ul className="sequence-list" aria-live="polite">
          {convertToMusicNotation.map((entry, index) => (
            <li key={`${entry}-${index}`} className="sequence-badge">
              {entry}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
