# Todd's Quick Notes — Markdown Editor — Last Updated: 2026-08-09

A client-side note-taking app with real-time markdown preview. No server, no backend, no account — everything runs in your browser.

- **Live URL**: `https://toddwmac.github.io/my-notes-app/`
- **Tech**: TypeScript, Vite, IndexedDB, GitHub Pages

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                     Browser                      │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐ │
│  │  Editor  │  │ NoteList │  │ MarkdownPreview│ │
│  │  (input) │  │ (cards)  │  │  (rendered)   │ │
│  └────┬─────┘  └────┬─────┘  └───────┬───────┘ │
│       │             │               │          │
│       └──────┬──────┘               │          │
│              │                      │          │
│         ┌────▼────┐          ┌─────▼──────┐   │
│         │  state  │          │  marked +  │   │
│         │ (pub/sub)│         │  DOMPurify  │   │
│         └────┬────┘          └────────────┘   │
│              │                                │
│         ┌────▼────┐                           │
│         │   db.ts  │                           │
│         │ (idb)    │                           │
│         └────┬────┘                           │
│              │                                │
│         ┌────▼────┐                           │
│         │ IndexedDB│                           │
│         └─────────┘                           │
└─────────────────────────────────────────────────┘
```

### Data flow

1. User types in the editor → `updatePreview()` renders markdown via `marked` + `DOMPurify`
2. User clicks Save → `editor.ts` calls `db.saveNote()` → written to IndexedDB → `notify()` fires
3. `notify()` triggers `note-list.ts` to re-query IndexedDB and re-render the grid
4. User clicks a note card's Edit → `editor.ts` loads the note into the textarea → re-save calls `db.updateNote()`

### Key principle: state flows one direction

```
User action → db.ts (IndexedDB) → notify() → components re-render from IndexedDB
```

Components never hold their own copy of note data. They always read fresh from the database. The `state.ts` module is just a pub/sub event bus — no data stored in it.

---

## Technology Choices

| Choice | Why |
|---|---|
| **TypeScript** | Catches type errors at build time. The `Note` interface enforces the data shape across every layer. |
| **Vite** | Zero-config TypeScript + CSS bundling. Hot module replacement in dev. Tree-shakes `marked` in production. |
| **IndexedDB via `idb`** | Persistent browser storage with no size limits. The raw IndexedDB API is callback-based and verbose; `idb` wraps it in ergonomic promises. |
| **`marked` + `DOMPurify`** | `marked` parses markdown to HTML. `DOMPurify` sanitizes the output before injecting into the DOM (XSS prevention). Both available as npm packages with TypeScript types. |
| **GitHub Pages** | Free static hosting. No server costs, no cold starts, no maintenance. |
| **No framework** | At ~12 components and a single data type, a framework added more weight than value. The pub/sub pattern in `state.ts` (10 lines) replaced what a store library would do. |
| **Plain CSS with custom properties** | No build-step dependency for styles. Custom properties handle theming (light/dark) without JavaScript except for the toggle. |

### What we removed (v2 → v3)

| Removed | Replaced by |
|---|---|
| Express server (`server.js`) | IndexedDB (browser-native) |
| Replit Database / JSON file (`store.js`) | IndexedDB (browser-native) |
| Monolithic `script.js` (890 lines) | 8 TypeScript modules |
| CDN `<script>` tags for `marked` + `DOMPurify` | npm packages, bundled by Vite |
| `@types/dompurify` stub package | DOMPurify v3 ships its own types |

---

## Project Structure

```
my-notes-app/
├── .github/workflows/
│   └── deploy.yml              # GitHub Actions: build + deploy to Pages
├── src/
│   ├── components/
│   │   ├── dark-mode.ts        # Theme toggle, reads/writes localStorage
│   │   ├── delete-modal.ts     # "Are you sure?" confirmation dialog
│   │   ├── edit-modal.ts       # Inline edit with live markdown preview
│   │   ├── editor.ts           # Textarea, toolbar (bold/italic/H1-H3), save/clear
│   │   ├── markdown-help.ts    # Cheat sheet modal
│   │   ├── note-list.ts        # Note grid rendering, search/filter, card creation
│   │   ├── preview.ts          # Copy HTML, copy formatted, select all
│   │   └── toast.ts            # Transient notification at bottom-right
│   ├── db.ts                   # IndexedDB CRUD via `idb` wrapper
│   ├── main.ts                 # Entry point: wires all components on DOMContentLoaded
│   ├── state.ts                # Pub/sub: subscribe(fn) → notify()
│   ├── style.css               # Design tokens, layout, components, modals, responsive
│   └── types.ts                # Note, ToastType, callback types
├── index.html                  # App shell with all DOM elements (no framework templating)
├── package.json                # Dependencies + scripts (dev, build, preview)
├── tsconfig.json               # Strict TypeScript, ES2022 target, bundler module resolution
├── vite.config.ts              # base: '/my-notes-app/', output: dist/
└── README.md
```

### Component responsibilities

- **No shared mutable state between components.** Each component module exports an `init*()` function called once at startup.
- **Cross-component communication** happens through:
  - `notify()` in `state.ts` (editor saves → note list re-renders)
  - Direct function imports (delete modal calls `handleDeleteNote` from note-list)
  - DOM IDs as a public API (editor exposes `setEditingNote()` which reads/writes `#note-input`)

---

## Data Layer

### IndexedDB schema

```
Database: NotesDB (v1)
  Object store: notes
    keyPath: "id"
    indexes:
      createdAt  (for sort order)
      updatedAt  (available for future use)
```

### Note type

```typescript
interface Note {
  id: string        // crypto.randomUUID()
  text: string      // raw markdown
  createdAt: number  // Date.now()
  updatedAt: number  // Date.now()
}
```

### Operations exposed by `db.ts`

| Function | Description |
|---|---|
| `listNotes()` | All notes, sorted by createdAt ascending |
| `getNote(id)` | Single note by ID |
| `saveNote(note)` | Create new note (generates updatedAt) |
| `updateNote(id, text)` | Update existing note, preserves createdAt |
| `deleteNote(id)` | Remove by ID |
| `searchNotes(query)` | Case-insensitive text search across all notes |

### State management (`state.ts`)

```typescript
// Subscribe to changes
const unsubscribe = subscribe(() => refreshNotes())

// Trigger all subscribers
notify()
```

10 lines total. No data stored — only a `Set<() => void>` of listeners. Components re-read from IndexedDB when notified.

### localStorage usage

Only for non-data preferences:
- `theme`: `"light"` or `"dark"` (dark mode toggle)

---

## CSS Design System

Token-based with CSS custom properties defined in `:root`. Light and dark themes via `[data-color-scheme="dark"]` attribute (takes precedence over `prefers-color-scheme` media query).

### Token categories

- **Colors**: bg, surface, text (primary/secondary/tertiary), semantic (primary, danger, success, info, warning)
- **Spacing**: xs (4px) through 3xl (40px)
- **Border radius**: sm (4px), md (8px), lg (12px), pill (9999px)
- **Shadows**: sm through xl
- **Transitions**: fast (150ms), normal (200ms), slow (300ms)

### Pattern

- BEM-like naming (`.btn--primary`, `.note-actions`, `.editor-actions__right`)
- No CSS framework — custom properties give the same benefits without a dependency
- `prefers-reduced-motion` respected globally
- Print styles hide UI chrome

---

## Build Pipeline

### Local development

```bash
npm install         # one-time
npm run dev         # Vite dev server with HMR at localhost:5173/my-notes-app/
```

`npm run dev` runs `vite` directly. TypeScript is transpiled on-the-fly — no separate `tsc` step needed during development.

### Production build

```bash
npm run build       # tsc (type-check) + vite build → dist/
```

Output:

| File | Size | Gzipped |
|---|---|---|
| `index.html` | 12.3 KB | 2.8 KB |
| `assets/index-*.css` | 18.8 KB | 3.6 KB |
| `assets/index-*.js` | 86.1 KB | 28.3 KB |

### Deploy (GitHub Pages)

Push to `main` triggers `.github/workflows/deploy.yml`:

```yaml
# Two-job pipeline
build:
  1. checkout
  2. setup-node (v20)
  3. npm ci          # clean install from lockfile
  4. npm run build   # tsc + vite build → dist/
  5. configure-pages # detect base path
  6. upload-pages-artifact  # upload dist/ as artifact

deploy (needs: build):
  7. deploy-pages    # publish artifact to github-pages environment
```

#### Critical configuration

The workflow **must** split build and deploy into separate jobs with the `environment: github-pages` block. A single job with all steps in sequence **will not deploy** — GitHub Pages requires the deploy step to target the `github-pages` deployment environment explicitly. The `pages: write` and `id-token: write` permissions must be on the deploy job, not the top-level workflow.

Repository setup: **Settings → Pages → Source → GitHub Actions** (one-time).

URL: `https://<owner>.github.io/<repo-name>/`
The `base` in `vite.config.ts` must match the repo name: `base: '/my-notes-app/'`.

---

## Lessons Learned

### During v3 refactor

1. **`disabled` attribute blocks click events.** The save button had `disabled` in the HTML with no code to enable it. In v2 this was masked because Ctrl+Enter bypassed the button. Fixed by removing `disabled` from the markup.

2. **`@types/dompurify` is a stub.** DOMPurify v3 ships its own TypeScript definitions. Installing `@types/dompurify` adds an unnecessary dependency. Remove it.

3. **GitHub Pages deploy requires `environment: github-pages`.** Without this block on the deploy job, `actions/deploy-pages@v4` runs but produces no deployment. The workflow must use a two-job structure (build → deploy) with the environment on the deploy job only.

4. **IndexedDB size limits are per-origin, not per-database.** No practical limit for a notes app. The `idb` library (`npm install idb`) gives a promise-based API that reads like normal async code.

5. **Pub/sub beats a state library for this scale.** A 10-line `subscribe`/`notify` in `state.ts` handles all cross-component communication. Components always re-read from the authoritative source (IndexedDB), so there's no risk of stale in-memory state.

6. **Plain CSS with custom properties scales well for theming.** The light/dark toggle is one attribute change on `<html>`. No JavaScript needed for computing colors — CSS custom properties cascade automatically.

7. **Vite's `base` config matters for GitHub Pages.** Since GitHub Pages serves from `/<repo-name>/`, Vite needs `base: '/my-notes-app/'` so that asset paths (`/my-notes-app/assets/index-*.js`) resolve correctly.

### General patterns worth reusing

- **One `types.ts` for the whole app.** A single file with all interfaces prevents circular dependencies and makes the data model obvious.
- **Components are functions, not classes.** `initDarkMode()`, `initEditor()`, etc. called once from `main.ts`. No `this`, no lifecycle methods, no inheritance.
- **Database is the single source of truth.** Components do not cache data in variables. Read → render → read again on change. This avoids the v2 pattern of reading state from the DOM (`updateLocalStorage()` walking `.note` elements).

---

## Using This as a Template

To clone this architecture for a new app:

### Keep

- `vite.config.ts` pattern (update `base` to match your repo name)
- `tsconfig.json` (strict mode, bundler resolution, ES2022 target)
- `.github/workflows/deploy.yml` (proven two-job structure)
- `src/state.ts` (pub/sub — works for any component-based app)
- `src/types.ts` pattern (single file for all interfaces)
- CSS custom properties approach for theming

### Replace

- `src/db.ts` — swap IndexedDB for your storage (localStorage, remote API, Firebase, etc.)
- `src/components/*` — rebuild for your domain
- `index.html` — your app shell

### Skip if unnecessary

- `marked` + `DOMPurify` — only needed for markdown rendering
- `idb` — only needed for IndexedDB
- Dark mode — remove `dark-mode.ts` and the `[data-color-scheme]` CSS block

### Minimum viable setup

```
src/
  main.ts       # init your components
  types.ts      # your data interfaces
  style.css     # your styles
index.html      # your HTML
package.json    # your deps + scripts
vite.config.ts  # your build config
tsconfig.json   # strict TypeScript
.github/workflows/deploy.yml  # copy as-is (update base in vite.config.ts)
```
