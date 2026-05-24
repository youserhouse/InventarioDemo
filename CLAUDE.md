# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

There is no build process. Serve the files with any static HTTP server:

```bash
python3 -m http.server 8080
# or
npx serve .
# or simply open index.html directly in a browser
```

There are no dependencies to install, no compilation step, and no tests or linter configured.

## Architecture

This is a **pure vanilla JS/HTML/CSS single-page application** — no frameworks, no bundler, no npm. Three files make up the entire app:

- `index.html` — all HTML structure and inline styles for layout
- `styles.css` — CSS variables-based theming (dark/light), layout primitives, component styles
- `app.js` — all application logic (332 lines, no modules, global functions)

### Data Flow

All state lives in **`localStorage`** under five keys:

| Key | Contents |
|---|---|
| `ic_theme` | `"dark"` or `"light"` |
| `ic_config` | Box sizes + burger prices (`CFG` object) |
| `ic_apertura` | Opening inventory (meat boxes/loose, bread boxes/loose, sauce bottles) |
| `ic_ventas` | Daily revenue (card + cash in euros) |
| `ic_cierre` | Closing inventory (same shape as apertura) |

Config is also mirrored in the global `CFG` object in memory and kept in sync via `saveConfig()` / `loadConfig()`.

### Tab Workflow

The app has a linear 5-tab flow: **Apertura → Ventas → Cierre → Cuadre → Config**. Each "save" step (`saveApertura`, `saveVentas`, `saveCierre`) writes to localStorage and advances to the next tab. The Config tab is accessible at any time.

Tab state is tracked by CSS classes (`active`, `done`) on `.tab` elements via `goTo(n)`.

### Reconciliation Algorithm (`buildCuadre`)

The core business logic reads all three localStorage snapshots and computes:

```
initMeat  = apertura.meat_boxes  × CFG.meatBox  + apertura.meat_loose
initBread = apertura.bread_boxes × CFG.breadBox + apertura.bread_loose
finalMeat / finalBread — same formula with cierre values

meatConsumed  = initMeat  − finalMeat
breadConsumed = initBread − finalBread
burgersByStock = max(meatConsumed, breadConsumed)  // conservative: use the higher

burgersByMoney = (card + cash) / avgPrice()        // avgPrice = (priceJam + priceEsp) / 2
diff = burgersByStock − round(burgersByMoney)       // positive = missing inventory
```

Alert thresholds: `diff === 0` → ok; `0 < diff ≤ 2` → warn; `diff > 2` → danger; `diff < 0` → inverse anomaly.

Revenue validation uses a separate threshold on `|totalRevenue − expectedRevenue|`: `< €2` ok, `< €15` warn, `≥ €15` danger.

### Inventory Calculation (`calc(prefix)`)

`prefix` is either `'a'` (apertura) or `'c'` (cierre). The function reads box sizes **directly from the config `<input>` elements** (not from `CFG`), so it reflects in-progress edits before they're saved. Element IDs follow the pattern `{prefix}_meat_boxes`, `{prefix}_meat_loose`, `{prefix}_meat_total`, etc.

### Configuration Safeguards

- On init, a self-invoking function validates `ic_config` and removes it if box sizes are zero or invalid.
- `loadConfig()` / `saveConfig()` both enforce `meatBox ≥ 1` and `breadBox ≥ 1`.
- Input events for calc are bound three ways (`oninput`, `onchange`, `onkeyup` inline + `addEventListener` in JS) for broad browser compatibility.

## Conventions

- **Language**: all UI text, variable names in logic, and localStorage keys use Spanish (`apertura`, `cierre`, `cuadre`, `ventas`, `carne`, `pan`).
- **Number formatting**: displayed amounts use Spanish locale (comma decimal separator, e.g. `€14,50`), but input values and calculations use JS native floats.
- **No modules**: everything is global. Functions are called directly from `onclick` attributes in HTML.
- **CSS theming**: colours are CSS variables defined on `[data-theme="dark"]` and `[data-theme="light"]` selectors. The `--amber` variable is the primary accent colour.
- **Badge severity**: `.badge.ok` (green), `.badge.warn` (yellow), `.badge.bad` (red) — applied dynamically in `buildCuadre` and `setBadge`.
- **Defaults**: meat box = 72 units, bread box = 30 units, Space Jam = €13.50, Especial = €15.50.
