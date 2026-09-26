export const SIZE = 24;
export const PALETTE = [
  { name: "Ink", hex: "#243c42", symbol: "A" },
  { name: "Coral", hex: "#e2755d", symbol: "B" },
  { name: "Apricot", hex: "#efa660", symbol: "C" },
  { name: "Honey", hex: "#e9bf67", symbol: "D" },
  { name: "Moss", hex: "#769b7a", symbol: "E" },
  { name: "Sky", hex: "#89b6c8", symbol: "F" },
  { name: "Lilac", hex: "#ae9cbd", symbol: "G" },
  { name: "Rose", hex: "#dba7a1", symbol: "H" },
];

export function makeSeed() {
  const cells = Array(SIZE * SIZE).fill(-1);
  const put = (x, y, color) => {
    cells[y * SIZE + x] = color;
  };
  for (let y = 2; y < 22; y++) {
    for (let x = 2; x < 22; x++) {
      const dx = x - 11.5;
      const dy = y - 11.5;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > 8.1 && d < 9.7) put(x, y, 0);
      if (d < 7.3 && d > 4.8 && y > 6) put(x, y, 5);
      if (Math.abs(dx) + Math.abs(dy) < 5.5) put(x, y, 3);
      if (Math.abs(dx) + Math.abs(dy) < 3.2) put(x, y, 1);
    }
  }
  for (let y = 7; y < 18; y++) {
    if (cells[y * SIZE + 11] === -1) put(11, y, 4);
    if (cells[y * SIZE + 12] === -1) put(12, y, 4);
  }
  return {
    version: 1,
    width: SIZE,
    height: SIZE,
    name: "Sun in a blue window",
    palette: PALETTE.map((p) => ({ ...p })),
    cells,
  };
}

export function validatePattern(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("This file is not a Gridweave pattern.");
  if (value.version !== 1 || value.width !== SIZE || value.height !== SIZE)
    throw new Error("Only 24 × 24 Gridweave v1 patterns can be opened.");
  if (!Array.isArray(value.palette) || value.palette.length !== 8)
    throw new Error("The palette must have exactly eight colors.");
  const palette = value.palette.map((p, i) => {
    if (
      !p ||
      typeof p.name !== "string" ||
      p.name.length > 30 ||
      !/^#[0-9a-fA-F]{6}$/.test(p.hex) ||
      p.symbol !== String.fromCharCode(65 + i)
    ) {
      throw new Error("The palette contains an invalid color or symbol.");
    }
    return { name: p.name, hex: p.hex, symbol: p.symbol };
  });
  if (
    !Array.isArray(value.cells) ||
    value.cells.length !== SIZE * SIZE ||
    value.cells.some((c) => !Number.isInteger(c) || c < -1 || c > 7)
  ) {
    throw new Error("The grid contains missing or invalid stitches.");
  }
  if (typeof value.name !== "string" || value.name.length > 80)
    throw new Error("The pattern name is invalid.");
  return {
    version: 1,
    width: SIZE,
    height: SIZE,
    name: value.name,
    palette,
    cells: [...value.cells],
  };
}

export function paint(pattern, index, color) {
  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= SIZE * SIZE ||
    !Number.isInteger(color) ||
    color < -1 ||
    color > 7
  )
    return pattern;
  if (pattern.cells[index] === color) return pattern;
  const cells = [...pattern.cells];
  cells[index] = color;
  return { ...pattern, cells };
}

export function replaceColor(pattern, from, to) {
  if (
    !Number.isInteger(from) ||
    !Number.isInteger(to) ||
    from < 0 ||
    from > 7 ||
    to < -1 ||
    to > 7 ||
    from === to
  )
    return pattern;
  if (!pattern.cells.includes(from)) return pattern;
  return { ...pattern, cells: pattern.cells.map((c) => (c === from ? to : c)) };
}

export function countStitches(pattern) {
  const counts = Array(8).fill(0);
  for (const cell of pattern.cells) if (cell >= 0) counts[cell]++;
  return counts;
}
