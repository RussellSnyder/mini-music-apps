type ChordInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function ChordInput({ id, label, value, onChange }: ChordInputProps) {
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="B3, C4, D4"
        spellCheck="false"
        autoComplete="off"
      />
    </div>
  );
}

export default ChordInput;
