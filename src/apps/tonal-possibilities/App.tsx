"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Note } from "tonal";
import { chordAbc, inputToAbc, scaleAbc } from "./abc";
import { playAbc } from "./player";
import { getPossibilities, parseNotes, type Match } from "./possibilities";
import { ScaleDetails } from "./ScaleDetails";

const LIMIT = 60;

const TABS = [
  { id: "scales", label: "Scales" },
  { id: "chords", label: "Chords" },
] as const;

function MatchCard({
  notes,
  match,
  toAbc,
  expandable,
}: {
  match: Match;
  notes: string[];
  toAbc: (match: Match) => string;
  expandable: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <li className="rounded-lg border border-zinc-200 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold">{match.name}</span>
        <div className="flex items-center gap-2">
          {match.exact && (
            <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
              exact
            </span>
          )}
          <button
            type="button"
            onClick={() => playAbc(toAbc(match)).catch(console.warn)}
            aria-label={`Play ${match.name}`}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-base font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            ▶ Play
          </button>
        </div>
      </div>
      <p className="font-mono text-sm text-zinc-600">
        {match.notes.map((note) => (
          <span
            className={`mr-1 text-lg ${[...notes].includes(note) || [...notes].includes(Note.enharmonic(note)) ? "underline" : ""}`}
            key={note}
          >
            {note}
          </span>
        ))}
      </p>
      {expanded && <ScaleDetails match={match} />}
      {expandable && (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            aria-expanded={expanded}
            aria-label={`${expanded ? "Collapse" : "Expand"} ${match.name}`}
            className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200"
          >
            {expanded ? "▲ Collapse" : "Expand ▶"}
          </button>
        </div>
      )}
    </li>
  );
}

function MatchList({
  title,
  matches,
  notes,
  toAbc,
}: {
  title: string;
  matches: Match[];
  notes: string[];
  toAbc: (match: Match) => string;
}) {
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? matches : matches.slice(0, LIMIT);

  return (
    <section className="flex flex-col gap-3" aria-label={title}>
      {matches.length === 0 && (
        <p className="text-zinc-500">Nothing contains all of these notes.</p>
      )}
      <ul className="grid gap-2 sm:grid-cols-2">
        {shown.map((match) => (
          <MatchCard
            key={`${match.root}-${match.type}`}
            match={match}
            notes={notes}
            toAbc={toAbc}
            expandable={title === "Scales"}
          />
        ))}
      </ul>
      {matches.length > LIMIT && (
        <button
          type="button"
          onClick={() => setShowAll((current) => !current)}
          className="self-start text-sm text-indigo-600 hover:underline"
        >
          {showAll ? "Show fewer" : `Show all ${matches.length}`}
        </button>
      )}
    </section>
  );
}

function App() {
  const [view, setView] = useState<(typeof TABS)[number]["id"]>("scales");
  const [input, setInput] = useState("C E G");
  const { valid, invalid } = useMemo(() => parseNotes(input), [input]);
  const possibilities = useMemo(() => getPossibilities(valid), [valid]);

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 p-8">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        Mini Music Apps
      </Link>
      <h1 className="text-3xl font-semibold">Tonal Possibilities</h1>
      <p className="text-zinc-600">
        Enter some notes and see which chords and scales contain all of them.
        Exact matches have precisely those pitch classes.
      </p>
      <div className="flex flex-col gap-2">
        <label htmlFor="notes" className="font-semibold">
          Notes
        </label>
        <input
          id="notes"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="C E G"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-base outline-none transition focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20"
        />
        <p className="text-sm text-zinc-500">
          Separate notes with spaces or commas, e.g. C Eb G Bb. Octaves are
          ignored.
        </p>
        {valid.length > 0 && (
          <p className="font-mono text-sm text-zinc-700">
            ABC: {inputToAbc(valid)}
          </p>
        )}
        {invalid.length > 0 && (
          <p className="text-sm text-red-600" role="alert">
            Not recognised: {invalid.join(", ")}
          </p>
        )}
      </div>
      {valid.length > 0 && (
        <>
          <div className="flex gap-2" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={tab.id === view}
                onClick={() => setView(tab.id)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  tab.id === view
                    ? "bg-indigo-600 text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                {tab.label} ({possibilities[tab.id].length})
              </button>
            ))}
          </div>
          <div role="tabpanel">
            <MatchList
              notes={valid}
              key={`${view}-${valid.join()}`}
              title={view === "scales" ? "Scales" : "Chords"}
              matches={possibilities[view]}
              toAbc={view === "scales" ? scaleAbc : chordAbc}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
