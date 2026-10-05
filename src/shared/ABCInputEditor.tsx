"use client";
import abcjs from "abcjs";
import "abcjs/abcjs-audio.css";
import { useEffect, useRef, useState } from "react";

interface ABCInputEditorProps {
  value: string;
  onChange: (value: string) => void;
  playback?: boolean;
}

export function ABCInputEditor({
  value,
  onChange,
  playback = false,
}: ABCInputEditorProps) {
  const paperRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLDivElement>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isNotationRendered, setIsNotationRendered] = useState(false);

  useEffect(() => {
    if (!paperRef.current) return;
    paperRef.current.innerHTML = "";
    const [tune] = abcjs.renderAbc(paperRef.current, value, {
      responsive: "resize",
      add_classes: true,
    });
    setWarnings(tune?.warnings ?? []);
    setIsNotationRendered(true);

    if (!playback || !tune || !audioRef.current) return;
    if (!abcjs.synth.supportsAudio()) return;

    audioRef.current.innerHTML = "";
    const synthControl = new abcjs.synth.SynthController();
    synthControl.load(audioRef.current, undefined, {
      displayRestart: true,
      displayPlay: true,
      displayProgress: true,
      displayWarp: true,
    });
    new abcjs.synth.CreateSynth()
      .init({ visualObj: tune })
      .then(() => synthControl.setTune(tune, false))
      .catch((error) => console.warn("Error setting up audio synth:", error));

    return () => {
      try {
        synthControl.pause();
        synthControl.disable(true);
      } catch {
        // ignore cleanup errors
      }
    };
  }, [value, playback]);

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <textarea
          className="field-sizing-content min-h-40 rounded-lg border border-zinc-300 bg-white p-3 font-mono text-sm text-zinc-900"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          aria-describedby="abc-warnings"
        />
      </label>
      <div className="relative min-h-32 rounded-lg border border-zinc-200 bg-white p-4 text-zinc-900">
        <div ref={paperRef} />
        {!isNotationRendered && (
          <div
            role="status"
            className="absolute inset-0 flex items-center justify-center gap-3 text-sm font-medium text-zinc-500"
          >
            <span className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            Loading notation...
          </div>
        )}
      </div>
      {playback && <div ref={audioRef} />}
      <ul
        id="abc-warnings"
        className="list-disc pl-5 text-sm text-amber-700"
        aria-live="polite"
      >
        {warnings.map((warning, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: warning }} />
        ))}
      </ul>
    </div>
  );
}
