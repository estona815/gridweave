# Gridweave

Gridweave is a small, browser-local counted stitch pattern editor. Paint a 24 × 24 motif, switch between color and symbol views, replace a color throughout the chart, and print or export the pattern. No account, backend, paid API, or network access is required to use the editor. The optional Google Font falls back to local fonts when offline.

This project was created during the CodeStorm 2026: FutureForge published build period. The included sun motif was drawn in code for the demo. Palette colors are ordinary RGB values; they are **not** verified thread brand references.

## Run

Requirements: Node.js 20+ and pnpm.

```sh
pnpm install
pnpm dev
```

Open the local URL shown by Vite. `pnpm build` creates static files in `dist/`; `pnpm test` checks the pattern data rules.

## Use

- Choose a palette color, then click or drag across the grid. Right-click a cell or choose Erase to clear it.
- Use arrow keys to move between focused cells; Space or Enter paints the selected color.
- Use Undo / Redo to reverse edits. The editor autosaves to this browser's local storage.
- Save file exports a versioned JSON pattern. Open file accepts only a valid 24 × 24 Gridweave v1 pattern, so an invalid file cannot overwrite the current drawing.
- Print pattern prints a numbered grid, stitch symbols, and a color legend. Browser print settings determine the final paper layout.

## Scope and privacy

The app runs entirely in the browser. Pattern contents are not sent to a server by the app. Exporting a file is an explicit user action. The design is fixed at 24 × 24 and eight palette slots so editing and print output remain predictable.

## Verification

- `node --test src/model.test.js`
- `pnpm build`
- Browser check: paint one cell, undo, redo, inspect palette and mobile layout.

## License

Copyright 2026 Kwon Jun. All rights reserved pending the contest submission and a deliberate publishing decision.
