# Todd's Quick Notes - Markdown Editor

## Overview
This is a minimalistic web application for note-taking with real-time markdown preview. The app features a simple user interface for creating, viewing, and editing notes with markdown formatting support. It uses local storage to save notes and can be hosted on GitHub Pages.

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
- **Local Storage**: Notes are automatically saved in browser storage
- **Clean Interface**: Distraction-free writing environment
- **Instant Updates**: Markdown preview updates as you type

## File Structure
- `index.html`: The main HTML file that defines the structure of the app.
- `styles.css`: The CSS file that styles the app.
- `script.js`: The JavaScript file that handles the app's functionality.

## How It Works
1. **Creating Notes**: Users can write a note in the textarea and click the "Save Note" button to save the note. The note is displayed in the note container and saved in local storage.
2. **Saving Notes to File**: Each note has a "Save to File" button that allows users to save the note as a text file on their local machine. The file name is prefixed with "Todds_Quick_Note" followed by a timestamp.
3. **Deleting Notes**: Each note has a "Delete" button that allows users to delete the note. The note is removed from the note container and local storage is updated.
4. **Clearing All Notes**: The "Clear All Notes" button clears all notes from the note container and local storage.

## Hosting on GitHub Pages
1. Create a GitHub repository and push your code.
2. In the repository settings, enable GitHub Pages and set the source to the main branch.
3. Your app will be available at `https://<your-username>.github.io/<repository-name>`.
