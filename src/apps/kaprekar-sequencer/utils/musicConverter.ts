const noteNameMap: { [key: string]: string } = {
  0: "C",
  1: "Db",
  2: "D",
  3: "Eb",
  4: "E",
  5: "F",
  6: "Gb",
  7: "G",
  8: "Ab",
  9: "A",
  t: "Bb",
  e: "B",
};

export function translateToNoteNames(value: number | string) {
  return String(value)
    .split("")
    .map((str) => noteNameMap[str.toLowerCase()] ?? str)
    .join();
}
