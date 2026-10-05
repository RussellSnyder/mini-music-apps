type InitialSequenceInputProps = {
  label?: string;
  value?: string;
  placeholder?: string;
  base?: 10 | 12;
  onChange?: (value: string) => void;
};

export function InitialSequenceInput({
  label = "Initial sequence",
  value = "",
  placeholder = "e.g. 1234",
  base = 10,
  onChange,
}: InitialSequenceInputProps) {
  const getSanitizedValue = (rawValue: string) => {
    if (base === 12) {
      return rawValue.replace(/[^0-9a-et]/gi, "").toLowerCase();
    }

    return rawValue.replace(/\D/g, "");
  };

  return (
    <div className="sequence-input-group">
      <label htmlFor="initial-sequence" className="sequence-label">
        {label}
      </label>
      <input
        id="initial-sequence"
        type="text"
        className="sequence-input"
        value={value}
        placeholder={placeholder}
        inputMode={base === 12 ? "text" : "numeric"}
        pattern={base === 12 ? "[0-9a-etA-ET]+" : "[0-9]+"}
        onChange={(event) => onChange?.(getSanitizedValue(event.target.value))}
      />
    </div>
  );
}
