# Minimalistic Note-Taking App

## Overview
This is a minimalistic web application for text-only note-taking. The app features a simple user interface for creating, viewing, and editing notes. It uses local storage to save notes and can be hosted on GitHub Pages.

## Features
- **Text-only notes**: Users can create and save text-only notes.
- **Simple UI**: The interface is minimalistic and straightforward.
- **Local storage**: Notes are saved in the browser's local storage.
- **Save to file**: Each note can be saved as a text file on the local machine.
- **Delete notes**: Users can delete individual notes.
- **Clear all notes**: Users can clear all notes at once.

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
