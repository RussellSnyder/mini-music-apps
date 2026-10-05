import React, { useEffect, useRef } from "react";

interface HtmlMidiPlayerProps {
  dataUri: string;
  fileName?: string;
}

export function HtmlMidiPlayer({ dataUri, fileName }: HtmlMidiPlayerProps) {
  const playerRef = useRef<HTMLElement>(null);
  const visualizerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // The prebuilt bundle registers the custom elements and is browser-only.
    // @ts-expect-error no type declarations for the prebuilt bundle
    import("html-midi-player/dist/midi-player.min.js");
  }, []);

  useEffect(() => {
    if (playerRef.current && visualizerRef.current) {
      const player = playerRef.current as HTMLElement & {
        addVisualizer?: (v: HTMLElement) => void;
      };
      if (typeof player.addVisualizer === "function") {
        player.addVisualizer(visualizerRef.current);
      }
    }
  }, [dataUri]);

  if (!dataUri) return null;

  return (
    <div className="html-midi-player-container my-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex flex-col gap-4">
      {fileName && (
        <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">
          {fileName}
        </h3>
      )}

      {/* Visualizer (Staff) */}
      <div className="w-full bg-white p-4 rounded-lg border border-gray-200 overflow-x-auto">
        {React.createElement("midi-visualizer", {
          ref: visualizerRef,
          type: "staff",
          src: dataUri,
          style: { width: "100%", minHeight: "150px", display: "block" },
        })}
      </div>

      {/* Controls & Sound Font Player */}
      {React.createElement("midi-player", {
        ref: playerRef,
        src: dataUri,
        soundFont:
          "https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus",
        style: { width: "100%", display: "block" },
      })}
    </div>
  );
}
