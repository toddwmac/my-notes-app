import { openDB, type IDBPDatabase } from 'idb'
import type { Note } from './types'

const DB_NAME = 'NotesDB'
const DB_VERSION = 1
const STORE_NAME = 'notes'

let dbPromise: Promise<IDBPDatabase>

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('createdAt', 'createdAt')
          store.createIndex('updatedAt', 'updatedAt')
        }
      },
    })
  }
  return dbPromise
}

export async function listNotes(): Promise<Note[]> {
  const db = await getDB()
  const notes = await db.getAll(STORE_NAME)
  return notes.sort((a, b) => a.createdAt - b.createdAt)
}

export async function getNote(id: string): Promise<Note | undefined> {
  const db = await getDB()
  return db.get(STORE_NAME, id)
}

export async function saveNote(note: Omit<Note, 'updatedAt'>): Promise<Note> {
  const db = await getDB()
  const fullNote: Note = { ...note, updatedAt: Date.now() }
  await db.put(STORE_NAME, fullNote)
  return fullNote
}

export async function updateNote(id: string, text: string): Promise<Note | undefined> {
  const db = await getDB()
  const existing = await db.get(STORE_NAME, id)
  if (!existing) return undefined
  const updated: Note = { ...existing, text, updatedAt: Date.now() }
  await db.put(STORE_NAME, updated)
  return updated
}

export async function deleteNote(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

export async function searchNotes(query: string): Promise<Note[]> {
  const db = await getDB()
  const all = await db.getAll(STORE_NAME)
  if (!query.trim()) return all.sort((a, b) => a.createdAt - b.createdAt)
  const lower = query.toLowerCase()
  return all
    .filter((n) => n.text.toLowerCase().includes(lower))
    .sort((a, b) => a.createdAt - b.createdAt)
}

export async function exportAllNotes(): Promise<Note[]> {
  return listNotes()
}

export async function importNotes(notes: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Note[]> {
  const result: Note[] = []
  for (const n of notes) {
    const note = await saveNote({
      id: crypto.randomUUID(),
      text: n.text,
      createdAt: Date.now(),
    })
    result.push(note)
  }
  return result
}
