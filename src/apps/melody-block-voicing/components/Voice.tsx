"use client";
import { AbcViewer } from "@/shared/AbcViewer";
import { useMemo, useState } from "react";
import { transposeAbcDownByScaleSteps } from "../utils/voicing";

export type VoiceValue = {
  id: string;
  stepsBelow: number;
};

type VoiceProps = {
  index: number;
  value: VoiceValue;
  melodyAbc: string;
  root: string;
  scale: string;
  onChange: (value: VoiceValue) => void;
  onRemove: () => void;
};

export function Voice({
  index,
  value,
  melodyAbc,
  root,
  scale,
  onChange,
  onRemove,
}: VoiceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const inputId = `voice-${value.id}-steps-below`;
  const abcNotation = useMemo(
    () =>
      transposeAbcDownByScaleSteps(melodyAbc, value.stepsBelow, root, scale),
    [melodyAbc, value.stepsBelow, root, scale],
  );

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-4">
      <h3 className="text-lg font-semibold">Voice {index + 1}</h3>
      <div className="flex items-end gap-4">
        <div className="flex flex-1 items-center gap-2">
          <label htmlFor={inputId} className="font-semibold mr-4">
            steps below
          </label>
          <input
            id={inputId}
            type="number"
            min={0}
            step={1}
            value={value.stepsBelow}
            onChange={(e) =>
              onChange({ ...value, stepsBelow: e.target.valueAsNumber || 0 })
            }
            className="w-18 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20"
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove voice ${index + 1}`}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
        >
          Remove
        </button>
      </div>
      {abcNotation && (
        <details
          open={isOpen}
          onToggle={(e) => setIsOpen(e.currentTarget.open)}
        >
          <summary className="cursor-pointer text-sm font-medium text-zinc-700">
            Notation and playback
          </summary>
          {isOpen && (
            <div className="pt-4">
              <AbcViewer abcNotation={abcNotation} />
            </div>
          )}
        </details>
      )}
    </div>
  );
}
