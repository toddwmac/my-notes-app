import Database from '@replit/database';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dual backend: Replit DB or local JSON fallback
const useReplit = process.env.REPLIT_DB_URL !== undefined;
const db = useReplit ? new Database() : null;
const localPath = path.join(__dirname, 'notes.local.json');

// Helper to load notes from local JSON file
async function loadLocalNotes() {
  try {
    const content = await fs.readFile(localPath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    if (err.code === 'ENOENT') return {};
    throw err;
  }
}

// Helper to save notes to local JSON file
async function saveLocalNotes(notes) {
  await fs.mkdir(path.dirname(localPath), { recursive: true });
  await fs.writeFile(localPath, JSON.stringify(notes, null, 2), 'utf-8');
}

// Storage interface: list, set, get, delete
export async function list() {
  if (useReplit) {
    const keys = await db.list('note:');
    const notes = [];
    for (const key of keys) {
      const note = await db.get(key);
      if (note) {
        notes.push({ ...note, id: key.replace('note:', '') });
      }
    }
    // Sort by createdAt ascending
    return notes.sort((a, b) => a.createdAt - b.createdAt);
  } else {
    const notesObj = await loadLocalNotes();
    const notes = Object.entries(notesObj).map(([id, note]) => ({
      id,
      text: note.text,
      createdAt: note.createdAt
    }));
    return notes.sort((a, b) => a.createdAt - b.createdAt);
  }
}

export async function set(key, value) {
  if (useReplit) {
    await db.set('note:' + key, value);
  } else {
    const notes = await loadLocalNotes();
    notes[key] = value;
    await saveLocalNotes(notes);
  }
}

export async function get(key) {
  if (useReplit) {
    const note = await db.get('note:' + key);
    return note ? { ...note, id: key } : null;
  } else {
    const notes = await loadLocalNotes();
    const note = notes[key];
    return note ? { ...note, id: key } : null;
  }
}

export async function deleteNote(key) {
  if (useReplit) {
    await db.delete('note:' + key);
  } else {
    const notes = await loadLocalNotes();
    delete notes[key];
    await saveLocalNotes(notes);
  }
}
