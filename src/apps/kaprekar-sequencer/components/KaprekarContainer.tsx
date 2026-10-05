import { InitialSequenceInput } from "@/apps/kaprekar-sequencer/components/InitialSequenceInput";
import { SequenceList } from "@/apps/kaprekar-sequencer/components/SequenceList";
import { calculateKaprekarSequence } from "@/apps/kaprekar-sequencer/services/kaprekarSequence";
import { useMemo, useState } from "react";

export const KaprekarContainer: React.FC = () => {
  const [value, setValue] = useState("6174");
  const [base, setBase] = useState<10 | 12>(10);

  const handleBaseChange = (nextBase: 10 | 12) => {
    if (nextBase === base) {
      return;
    }

    setBase(nextBase);
    setValue("");
  };

  const sequence = useMemo(
    () => calculateKaprekarSequence(value, base),
    [base, value],
  );

  return (
    <section className="composer-panel">
      <p className="intro-text">Compose music using the Kaprekar algorithm</p>

      <div className="base-toggle" aria-label="Choose base">
        <button
          type="button"
          className={
            base === 10 ? "base-toggle-button active" : "base-toggle-button"
          }
          onClick={() => handleBaseChange(10)}
        >
          base10
        </button>
        <button
          type="button"
          className={
            base === 12 ? "base-toggle-button active" : "base-toggle-button"
          }
          onClick={() => handleBaseChange(12)}
        >
          base12
        </button>
      </div>
      <p className="mb-8 text-sm text-gray-500">
        {base === 10 && <div className="note">constant is 9174</div>}
        {base === 12 && <div className="note">constant is 83e74</div>}
      </p>

      <InitialSequenceInput
        value={value}
        base={base}
        onChange={setValue}
        placeholder={base === 10 ? "e.g. 6174" : "e.g. 7t23e"}
      />

      <p className="base-note">
        {base === 10
          ? "In base10, 4-digit sequences lead to the Kaprekar constant."
          : "In base12, 5-digit sequences lead to the Kaprekar constant."}
      </p>

      <SequenceList values={sequence} />

      {sequence.length >= 19 && <p>Terminating sequence not reached</p>}
    </section>
  );
};
