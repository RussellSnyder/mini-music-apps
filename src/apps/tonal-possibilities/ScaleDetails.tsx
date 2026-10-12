import { Interval, Scale } from "tonal";
import type { Match } from "./possibilities";

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <dt className="w-32 shrink-0 font-semibold text-zinc-700">{label}</dt>
      <dd className="font-mono text-zinc-600">{children}</dd>
    </div>
  );
}

export function ScaleDetails({ match }: { match: Match }) {
  const scale = Scale.get(`${match.root} ${match.type}`);
  if (scale.empty) return null;

  const modes = Scale.modeNames(scale.name).map(
    ([tonic, mode]) => `${tonic} ${mode}`,
  );
  const chords = Scale.scaleChords(scale.name);
  const semitones = scale.intervals.map((i) => Interval.semitones(i));

  return (
    <dl className="mt-3 flex flex-col gap-2 border-t border-zinc-200 pt-3 text-sm">
      {chords.length > 0 && (
        <Row label="Chords that fit">{chords.join(" ")}</Row>
      )}
      <Row label="Intervals">{scale.intervals.join(" ")}</Row>
      <Row label="Semitones">{semitones.join(" ")}</Row>
      {scale.aliases.length > 0 && (
        <Row label="Also known as">{scale.aliases.join(", ")}</Row>
      )}
      <Row label="Pitch class set">
        {scale.chroma} (#{scale.setNum})
      </Row>
      {modes.length > 0 && <Row label="Modes">{modes.join(", ")}</Row>}
    </dl>
  );
}
