# Todd's Quick Notes - Markdown Editor

A minimalistic, client-side web application for note-taking with real-time markdown preview. Notes are stored in your browser using **IndexedDB** — no server, no backend, no account required.

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript (strict mode) |
| Build tool | Vite |
| Storage | IndexedDB (via `idb`) |
| Markdown | `marked` + `DOMPurify` |
| Hosting | GitHub Pages |

## Features

- Real-time markdown preview as you type
- Markdown toolbar: bold, italic, strikethrough, headers (H1-H3)
- Keyboard shortcuts: Ctrl+B (bold), Ctrl+I (italic), Ctrl+Enter (save)
- Create, edit, delete, and download notes
- Search/filter notes
- Dark mode with system preference detection
- Copy formatted HTML to clipboard
- Load notes from `.txt`/`.md` files
- Paste from clipboard
- Responsive design (desktop + mobile)
- Accessible (ARIA, skip links, keyboard navigation, reduced motion)

## Project Structure

```
src/
  components/
    dark-mode.ts      # Theme toggle (localStorage)
    delete-modal.ts   # Delete confirmation dialog
    edit-modal.ts     # Edit note with live preview
    editor.ts         # Editor textarea + toolbar
    markdown-help.ts  # Markdown cheat sheet modal
    note-list.ts      # Note grid, cards, search
    preview.ts        # Markdown preview + copy actions
    toast.ts          # Toast notifications
  db.ts               # IndexedDB CRUD operations
  main.ts             # Entry point
  state.ts            # Reactive pub/sub state
  style.css           # Design system + styles
  types.ts            # TypeScript interfaces
index.html            # App shell
vite.config.ts        # Vite configuration
tsconfig.json         # TypeScript configuration
.github/workflows/
  deploy.yml          # GitHub Pages auto-deploy
```

## Workflow

### One-time setup

1. Run `npm install` to install dependencies.
2. On GitHub, go to repo **Settings → Pages**, set **Source** to **GitHub Actions**.

### Make changes and deploy

```bash
# 1. Edit source files in src/
# 2. Preview changes locally (optional)
npm run dev          # http://localhost:5173/my-notes-app/ — hot reloads on save

# 3. Commit and push
git add .
git commit -m "Describe your change"
git push
```

That's it. The GitHub Actions workflow (`.github/workflows/deploy.yml`) runs `npm ci && npm run build` and deploys the `dist/` folder on every push to `main`. You never need to run `npm run build` locally — the CI handles it.

Your app is live at:

```
https://<your-username>.github.io/my-notes-app/
```

No server, no database, no API keys. All data lives in your browser via IndexedDB.
