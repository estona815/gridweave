import React, { useEffect, useRef, useState } from "react";
import {
  SIZE,
  makeSeed,
  paint,
  replaceColor,
  validatePattern,
  countStitches,
} from "./model.js";

const STORAGE_KEY = "gridweave-pattern-v1";
const initial = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? validatePattern(JSON.parse(stored)) : makeSeed();
  } catch {
    return makeSeed();
  }
};

function Icon({ type }) {
  const shared = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };
  if (type === "undo")
    return (
      <svg {...shared}>
        <path d="M8 7H3v5" />
        <path d="M3 12a8 8 0 1 1 2.3 5.7" />
      </svg>
    );
  if (type === "redo")
    return (
      <svg {...shared}>
        <path d="M16 7h5v5" />
        <path d="M21 12a8 8 0 1 0-2.3 5.7" />
      </svg>
    );
  if (type === "download")
    return (
      <svg {...shared}>
        <path d="M12 3v12m-4-4 4 4 4-4M4 17v3h16v-3" />
      </svg>
    );
  if (type === "upload")
    return (
      <svg {...shared}>
        <path d="M12 17V5m-4 4 4-4 4 4M4 17v3h16v-3" />
      </svg>
    );
  if (type === "print")
    return (
      <svg {...shared}>
        <path d="M6 9V3h12v6M6 18H4V9h16v9h-2M6 14h12v7H6z" />
      </svg>
    );
  return null;
}

export default function App() {
  const [pattern, setPattern] = useState(initial);
  const patternRef = useRef(pattern);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [active, setActive] = useState(1);
  const [focusedCell, setFocusedCell] = useState(0);
  const [showSymbols, setShowSymbols] = useState(false);
  const [replaceFrom, setReplaceFrom] = useState("1");
  const [replaceTo, setReplaceTo] = useState("2");
  const [message, setMessage] = useState(
    "Your work saves automatically in this browser.",
  );
  const fileInput = useRef(null);
  const gridRef = useRef(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pattern));
  }, [pattern]);

  const commit = (candidate) => {
    const previous = patternRef.current;
    const next =
      typeof candidate === "function" ? candidate(previous) : candidate;
    if (next === previous) return;
    setHistory((h) => [...h.slice(-49), previous]);
    setFuture([]);
    patternRef.current = next;
    setPattern(next);
  };
  const applyCell = (index) =>
    commit((current) => paint(current, index, active));
  const undo = () => {
    if (!history.length) return;
    setFuture((f) => [pattern, ...f]);
    patternRef.current = history.at(-1);
    setPattern(history.at(-1));
    setHistory((h) => h.slice(0, -1));
  };
  const redo = () => {
    if (!future.length) return;
    setHistory((h) => [...h, pattern]);
    patternRef.current = future[0];
    setPattern(future[0]);
    setFuture((f) => f.slice(1));
  };
  const save = () => {
    const blob = new Blob([JSON.stringify(pattern, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "gridweave-pattern.json";
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Pattern exported as a portable JSON file.");
  };
  const open = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 100_000) {
      setMessage("That file is too large to be a 24 × 24 pattern.");
      return;
    }
    try {
      const candidate = validatePattern(JSON.parse(await file.text()));
      commit(candidate);
      setMessage(`Opened “${candidate.name || "Untitled"}”.`);
    } catch (error) {
      setMessage(error.message || "Could not open that pattern.");
    }
  };
  const onCellKeyDown = (event, index) => {
    const x = index % SIZE;
    const y = Math.floor(index / SIZE);
    const move = {
      ArrowLeft: [Math.max(0, x - 1), y],
      ArrowRight: [Math.min(SIZE - 1, x + 1), y],
      ArrowUp: [x, Math.max(0, y - 1)],
      ArrowDown: [x, Math.min(SIZE - 1, y + 1)],
    }[event.key];
    if (move) {
      event.preventDefault();
      gridRef.current
        ?.querySelector(`[data-index="${move[1] * SIZE + move[0]}"]`)
        ?.focus();
    }
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      applyCell(index);
    }
  };
  const counts = countStitches(pattern);
  const total = counts.reduce((a, b) => a + b, 0);

  return (
    <div
      className="app-shell"
      onPointerUp={() => {
        isDrawing.current = false;
      }}
    >
      <header className="topbar">
        <a className="brand" href="#studio" aria-label="Gridweave home">
          <span className="brand-mark" aria-hidden="true">
            ▦
          </span>
          <span>gridweave</span>
        </a>
        <div className="topbar-right">
          <span className="saved-indicator">
            <i /> Saved in this browser
          </span>
          <button
            className="button button-outline"
            onClick={() => window.print()}
          >
            <Icon type="print" /> Print pattern
          </button>
        </div>
      </header>

      <main id="studio" className="studio">
        <div className="intro-row">
          <div>
            <h1>
              Make a little
              <br />
              <em>something</em> beautiful.
            </h1>
            <p>
              Draw a counted stitch pattern, one square at a time. Keep the
              small details yours.
            </p>
          </div>
          <div className="intro-ornament" aria-hidden="true">
            <span>✳</span>
            <span>✦</span>
            <span>✳</span>
          </div>
        </div>

        <div className="workspace">
          <section className="canvas-panel" aria-label="Pattern editor">
            <div className="panel-head">
              <div>
                <label className="field-label" htmlFor="pattern-name">
                  PATTERN NAME
                </label>
                <input
                  id="pattern-name"
                  className="name-input"
                  value={pattern.name}
                  maxLength={80}
                  onChange={(e) => commit({ ...pattern, name: e.target.value })}
                />
              </div>
              <span className="size-tag">
                {SIZE} × {SIZE} STITCHES
              </span>
            </div>
            <div className="canvas-toolbar">
              <div className="toolbar-group">
                <button
                  title="Undo"
                  aria-label="Undo"
                  disabled={!history.length}
                  onClick={undo}
                >
                  <Icon type="undo" />
                </button>
                <button
                  title="Redo"
                  aria-label="Redo"
                  disabled={!future.length}
                  onClick={redo}
                >
                  <Icon type="redo" />
                </button>
                <span className="toolbar-divider" />
                <button
                  className={showSymbols ? "toggle selected" : "toggle"}
                  onClick={() => setShowSymbols((v) => !v)}
                  aria-pressed={showSymbols}
                >
                  A₁ <span>Symbols</span>
                </button>
              </div>
              <span className="toolbar-tip">
                Click or drag to draw · Right-click to erase
              </span>
            </div>
            <div className="canvas-wrap">
              <div className="ruler-top" aria-hidden="true">
                {Array.from({ length: SIZE }, (_, i) => (
                  <span key={i}>{i % 5 === 4 ? i + 1 : ""}</span>
                ))}
              </div>
              <div className="grid-with-ruler">
                <div className="ruler-side" aria-hidden="true">
                  {Array.from({ length: SIZE }, (_, i) => (
                    <span key={i}>{i % 5 === 4 ? i + 1 : ""}</span>
                  ))}
                </div>
                <div
                  className={
                    "stitch-grid" + (showSymbols ? " symbols-only" : "")
                  }
                  ref={gridRef}
                  role="grid"
                  aria-label="Editable 24 by 24 stitch grid"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  {pattern.cells.map((color, index) => (
                    <button
                      key={index}
                      type="button"
                      role="gridcell"
                      tabIndex={focusedCell === index ? 0 : -1}
                      data-index={index}
                      data-symbol={
                        color >= 0 ? pattern.palette[color].symbol : ""
                      }
                      aria-label={`Row ${Math.floor(index / SIZE) + 1}, column ${(index % SIZE) + 1}: ${color === -1 ? "empty" : pattern.palette[color].name}`}
                      style={{
                        "--stitch":
                          color === -1 ? "#fffdf8" : pattern.palette[color].hex,
                      }}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        isDrawing.current = true;
                        if (e.button === 2)
                          commit((current) => paint(current, index, -1));
                        else applyCell(index);
                      }}
                      onPointerEnter={(e) => {
                        if (isDrawing.current && e.buttons === 1)
                          applyCell(index);
                      }}
                      onKeyDown={(e) => onCellKeyDown(e, index)}
                      onFocus={() => setFocusedCell(index)}
                    >
                      {color >= 0 && showSymbols
                        ? pattern.palette[color].symbol
                        : ""}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="canvas-foot">
              <span>
                {total} stitches · {counts.filter(Boolean).length} colors
              </span>
              <span>Made slowly, made well.</span>
            </div>
          </section>

          <aside className="tools-panel" aria-label="Pattern tools">
            <section className="tool-section">
              <div className="section-number">01 / COLOR</div>
              <h2>Your palette</h2>
              <p>Select a color, then paint across the grid.</p>
              <div className="palette-grid">
                <button
                  className={
                    "swatch empty-swatch" + (active === -1 ? " active" : "")
                  }
                  onClick={() => setActive(-1)}
                  aria-pressed={active === -1}
                >
                  <span className="swatch-color">×</span>
                  <span className="swatch-name">Erase</span>
                </button>
                {pattern.palette.map((item, i) => (
                  <button
                    key={i}
                    className={"swatch" + (active === i ? " active" : "")}
                    onClick={() => setActive(i)}
                    aria-pressed={active === i}
                  >
                    <span
                      className="swatch-color"
                      style={{ backgroundColor: item.hex }}
                    >
                      {item.symbol}
                    </span>
                    <span className="swatch-name">{item.name}</span>
                    <small>{counts[i]}</small>
                  </button>
                ))}
              </div>
            </section>
            <section className="tool-section replace-section">
              <div className="section-number">02 / EDIT</div>
              <h2>Change a color</h2>
              <p>Swap every stitch of one color at once.</p>
              <div className="replace-controls">
                <label>
                  FROM
                  <select
                    value={replaceFrom}
                    onChange={(e) => setReplaceFrom(e.target.value)}
                  >
                    {pattern.palette.map((item, i) => (
                      <option value={i} key={i}>
                        {item.symbol} · {item.name}
                      </option>
                    ))}
                  </select>
                </label>
                <span aria-hidden="true">→</span>
                <label>
                  TO
                  <select
                    value={replaceTo}
                    onChange={(e) => setReplaceTo(e.target.value)}
                  >
                    <option value={-1}>Erase</option>
                    {pattern.palette.map((item, i) => (
                      <option value={i} key={i}>
                        {item.symbol} · {item.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button
                className="button button-dark full"
                onClick={() => {
                  const next = replaceColor(
                    pattern,
                    Number(replaceFrom),
                    Number(replaceTo),
                  );
                  commit(next);
                  setMessage(
                    next === pattern
                      ? "There were no stitches to change."
                      : "Color replaced across the pattern.",
                  );
                }}
              >
                Replace stitches
              </button>
            </section>
            <section className="tool-section file-section">
              <div className="section-number">03 / KEEP</div>
              <h2>Take it with you</h2>
              <p>
                Export a JSON pattern, reopen it later, or print a paper chart.
              </p>
              <div className="file-actions">
                <button className="button button-soft" onClick={save}>
                  <Icon type="download" /> Save file
                </button>
                <button
                  className="button button-soft"
                  onClick={() => fileInput.current?.click()}
                >
                  <Icon type="upload" /> Open file
                </button>
              </div>
              <input
                className="sr-only"
                ref={fileInput}
                type="file"
                accept="application/json,.json"
                onChange={open}
              />
              <p className="status-message" role="status">
                {message}
              </p>
            </section>
          </aside>
        </div>

        <section className="print-legend" aria-label="Printable color key">
          <h2>{pattern.name || "Untitled pattern"}</h2>
          <p>
            {SIZE} × {SIZE} counted stitch pattern · {total} stitches
          </p>
          <div>
            {pattern.palette.map((item, i) =>
              counts[i] ? (
                <span key={i}>
                  <b>{item.symbol}</b> {item.name} · {counts[i]}
                </span>
              ) : null,
            )}
          </div>
        </section>
      </main>
      <footer>
        Gridweave is a browser-local studio. Your pattern stays on this device
        unless you export it.
      </footer>
    </div>
  );
}
