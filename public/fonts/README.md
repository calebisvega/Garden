# Garden display font (OPTI Century Expanded Two)

Place your licensed font files here with these names so `app/globals.css` can load them:

- `OPTI-Century-Expanded-Two.woff2` (preferred)
- `OPTI-Century-Expanded-Two.woff` (optional fallback)
- `OPTI-Century-Expanded-Two.otf` (works, but heavier than woff2)

If these files are missing, the app still runs; `font-display` falls back to Georgia.

**Usage in code**

- `className="font-display"` — massive “GARDEN” titles, stock tickers, goal labels  
- `className="font-sans"` — Instrument Sans (labels, metadata, nav index)  
- `className="font-body"` — Cutive (typewriter body / briefings)
