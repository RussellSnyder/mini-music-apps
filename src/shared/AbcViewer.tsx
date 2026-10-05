import abcjs from "abcjs";
import "abcjs/abcjs-audio.css";
import { useEffect, useRef } from "react";

interface AbcViewerProps {
  abcNotation: string;
}

export function AbcViewer({ abcNotation }: AbcViewerProps) {
  const paperRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLDivElement>(null);
  const activeElementsRef = useRef<Element[][]>([]);

  useEffect(() => {
    let synthControl: InstanceType<typeof abcjs.synth.SynthController> | null =
      null;

    const clearHighlights = () => {
      activeElementsRef.current.forEach((elementSet) => {
        elementSet.forEach((el) => {
          el.classList.remove("abcjs-highlight");
        });
      });
      activeElementsRef.current = [];
    };

    const cursorControl = {
      onStart() {
        clearHighlights();
      },
      onEvent(event: { elements?: Element[][] }) {
        clearHighlights();
        if (event && event.elements) {
          event.elements.forEach((elementSet) => {
            elementSet.forEach((el) => {
              el.classList.add("abcjs-highlight");
            });
          });
          activeElementsRef.current = event.elements;
        }
      },
      onFinished() {
        clearHighlights();
      },
    };

    if (paperRef.current && abcNotation) {
      paperRef.current.innerHTML = "";
      if (audioRef.current) {
        audioRef.current.innerHTML = "";
      }

      const visualObjs = abcjs.renderAbc(paperRef.current, abcNotation, {
        responsive: "resize",
        add_classes: true,
      });

      if (
        visualObjs &&
        visualObjs.length > 0 &&
        audioRef.current &&
        abcjs.synth.supportsAudio()
      ) {
        synthControl = new abcjs.synth.SynthController();
        synthControl.load(audioRef.current, cursorControl, {
          displayRestart: true,
          displayPlay: true,
          displayProgress: true,
          displayWarp: true,
        });

        const createSynth = new abcjs.synth.CreateSynth();
        createSynth
          .init({ visualObj: visualObjs[0] })
          .then(() => {
            return synthControl?.setTune(visualObjs[0], false, {});
          })
          .catch((error) => {
            console.warn("Error setting up audio synth:", error);
          });
      }
    }

    return () => {
      clearHighlights();
      if (synthControl) {
        try {
          synthControl.pause();
          synthControl.disable(true);
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, [abcNotation]);

  if (!abcNotation) return null;

  return (
    <div className="abc-viewer my-6 p-4 bg-white text-gray-900 rounded-lg shadow border border-gray-200">
      <div ref={paperRef} />
      <div ref={audioRef} className="mt-4" />
    </div>
  );
}
