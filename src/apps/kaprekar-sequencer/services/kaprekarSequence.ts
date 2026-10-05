const fromBase12 = (str: string): number => {
  const digits = "0123456789te";
  let value = 0;

  for (const ch of str.toLowerCase()) {
    const digit = digits.indexOf(ch);

    if (digit === -1) {
      throw new Error(`Invalid base-12 digit: ${ch}`);
    }

    value = value * 12 + digit;
  }

  return value;
};

const toBase12 = (num: number): string => {
  if (num === 0) return "0";

  const digits = "0123456789te";
  let result = "";

  while (num > 0) {
    result = digits[num % 12] + result;
    num = Math.floor(num / 12);
  }

  return result;
};

function convertNumberToBase12String(number: number): string {
  if (number === 10) return "t";
  if (number === 11) return "e";
  return number.toString();
}

function convertBase12StringToNumber(str: string): number {
  if (str === "t") return 10;
  if (str === "e") return 11;
  return Number.parseInt(str, 10);
}

function getAscendingAndDescending(sequence: string): [string, string] {
  const stringArray = sequence.split("");
  const numberArrayBase10 = stringArray.map(convertBase12StringToNumber);

  const asc = numberArrayBase10
    .sort((a, b) => a - b)
    .map(convertNumberToBase12String)
    .join("");
  const desc = numberArrayBase10
    .sort((a, b) => b - a)
    .map(convertNumberToBase12String)
    .join("");

  return [asc, desc];
}

export function calculateKaprekarSequence(
  input: string | number,
  base: number = 10,
): Array<number | string> {
  const raw = String(input).trim();

  if (!raw) {
    return [];
  }

  if (base === 12) {
    const normalized = raw.toLowerCase();

    if (!/^[0-9a-et]+$/.test(normalized)) {
      return [];
    }

    const firstValue = fromBase12(normalized);
    const sequence: string[] = [toBase12(firstValue)];
    const seen = new Set<string>([toBase12(firstValue)]);
    let current = firstValue;

    for (let index = 0; index < 20; index += 1) {
      const digits = toBase12(current).padStart(normalized.length, "0");

      if (digits.length > normalized.length) {
        break;
      }

      const [ascending, descending] = getAscendingAndDescending(digits);
      const nextValue = fromBase12(descending) - fromBase12(ascending);
      const nextValueString = toBase12(nextValue);

      if (nextValue === current || seen.has(nextValueString)) {
        break;
      }

      current = nextValue;
      sequence.push(nextValueString);
      seen.add(nextValueString);
    }

    return sequence;
  }

  const digitLength = raw.length;
  const onlyDigits = raw.replace(/\D+/g, "");

  if (!onlyDigits) {
    return [];
  }

  const firstValue = Number(onlyDigits);

  if (!Number.isFinite(firstValue)) {
    return [];
  }

  const sequence: number[] = [firstValue];
  const seen = new Set<number>([firstValue]);
  let current = firstValue;

  for (let index = 0; index < 20; index += 1) {
    const digits = String(current).padStart(digitLength, "0");

    if (digits.length > digitLength) {
      break;
    }

    const descending = [...digits].sort((a, b) => b.localeCompare(a)).join("");
    const ascending = [...digits].sort((a, b) => a.localeCompare(b)).join("");

    const nextValue = Number(descending) - Number(ascending);

    if (nextValue === current || seen.has(nextValue)) {
      break;
    }

    current = nextValue;
    sequence.push(current);
    seen.add(current);
  }

  return sequence;
}
