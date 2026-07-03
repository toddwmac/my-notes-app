# Todd's Quick Notes - Markdown Editor

## Overview
This is a minimalistic web application for note-taking with real-time markdown preview. The app features a simple user interface for creating, viewing, and editing notes with markdown formatting support. It uses **Replit Database** for server-side persistence, allowing you to access your notes from any device.

## Features

### Markdown Editor
- **Real-time Markdown Preview**: Write in the main text area and see live HTML preview below
- **Full Markdown Support**: Headers, bold, italic, lists, links, code blocks, tables, blockquotes
- **Copy HTML**: Copy the rendered HTML to clipboard for use in other applications
- **Responsive Design**: Works on desktop and mobile devices

### Content Management
- **Load from File**: Load text files directly into the editor for markdown preview
- **Paste from Clipboard**: Paste content directly into the editor with one click
- **Save Notes**: Save your current work as individual note cards for later reference
- **Save to File**: Export individual notes as text files to your local machine
- **Clear All**: Clear the editor and all saved notes at once

### User Experience
- **Dark Mode**: Toggle between light and dark themes for comfortable editing
- **Cross-Device Access**: Notes are saved to Replit Database, accessible from any device/phone
- **Clean Interface**: Distraction-free writing environment
- **Instant Updates**: Markdown preview updates as you type

## File Structure
- `index.html`: The main HTML file that defines the structure of the app.
- `styles.css`: The CSS file that styles the app.
- `script.js`: The JavaScript file that handles the app's functionality.
- `server.js`: Node.js Express server with REST API.
- `store.js`: Storage abstraction layer for Replit Database and local JSON fallback.

## How It Works
1. **Creating Notes**: Users can write a note in the textarea and click the "Save Note" button to save the note. The note is sent to the server and saved in the Replit Database.
2. **Saving Notes to File**: Each note has a "Save to File" button that allows users to save the note as a text file on their local machine. The file name is prefixed with "Todds_Quick_Note" followed by a timestamp.
3. **Deleting Notes**: Each note has a "Delete" button that allows users to delete the note. The note is removed from the database.
4. **Cross-Device Sync**: Notes are stored server-side, so you can access them from any device (phone, another computer) by visiting your Replit URL.

## Hosting on Replit

This project ships with a [package.json](package.json) and a [.replit](.replit) config, so Replit **auto-detects the Node.js runtime** when you import it — no need to pick a template or runtime manually.

### Import from GitHub
1. Push your code to GitHub (if you haven't already):
   ```bash
   git add -A
   git commit -m "Add Replit backend and persistence"
   git push origin main
   ```
2. Go to [replit.com](https://replit.com) and sign in.
3. Click **Create Repl** (or **+ Create**) and select the **Import from GitHub** tab.
4. If prompted, connect your GitHub account, then paste the repo URL:
   `https://github.com/toddwmac/my-notes-app`
5. Click **Import Repl**. Replit detects Node.js from `package.json` and imports automatically.

### Starting the App
1. Once imported, Replit installs the npm dependencies on first run.
2. Press **Run** (or the big green ▶ button). Replit uses the `run` command in `.replit` (`npm start`).
3. The app opens in the Webview pane. Your public URL is shown there — anything of the form `https://<repl-name>.<your-username>.repl.co` (also find it under the Webview pane / "Open in a new tab").

> **Note on persistence:** The live data layer uses Replit's built-in database (`@replit/database`), which is only available *inside* the Replit environment. It's wired up automatically — no setup keys needed.

### Using on Multiple Devices
Open your Replit URL on any device (phone, tablet, another computer). Notes are stored server-side in Replit's database and sync automatically. Keep the repl running (or enable Always-On on a paid plan) for the URL to stay reachable.

### Local Development
To run the same app on your own machine:
```bash
npm install
npm start
```
Then open **http://localhost:3000**. Because the Replit database isn't available locally, the app transparently falls back to a local JSON file (`notes.local.json`, gitignored) — so notes still persist across restarts on your computer.
