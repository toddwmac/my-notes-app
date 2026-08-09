import { listNotes, deleteNote as dbDelete, searchNotes } from '../db'
import type { Note } from '../types'
import { showToast } from './toast'
import { showConfirmDelete } from './delete-modal'
import { setEditingNote } from './editor'

let currentQuery = ''

function el<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T
}

function createNoteCard(note: Note): HTMLDivElement {
  const card = document.createElement('div')
  card.className = 'note'
  card.setAttribute('data-note-id', note.id)
  card.setAttribute('role', 'listitem')

  const textEl = document.createElement('p')
  textEl.className = 'note-text'
  textEl.textContent = note.text
  card.appendChild(textEl)

  const metaEl = document.createElement('div')
  metaEl.className = 'note-meta'
  metaEl.textContent = new Date(note.createdAt).toLocaleString()
  card.appendChild(metaEl)

  const actions = document.createElement('div')
  actions.className = 'note-actions'

  const editBtn = document.createElement('button')
  editBtn.className = 'btn btn--ghost btn--sm'
  editBtn.textContent = 'Edit'
  editBtn.setAttribute('aria-label', `Edit note ${note.id}`)
  editBtn.addEventListener('click', () => {
    setEditingNote(note.id, note.text)
    el<HTMLTextAreaElement>('note-input').scrollIntoView({ behavior: 'smooth' })
  })
  actions.appendChild(editBtn)

  const downloadBtn = document.createElement('button')
  downloadBtn.className = 'btn btn--ghost btn--sm'
  downloadBtn.textContent = 'Download'
  downloadBtn.addEventListener('click', () => {
    const blob = new Blob([note.text], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `Todd_Quick_Note_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(a.href)
  })
  actions.appendChild(downloadBtn)

  const deleteBtn = document.createElement('button')
  deleteBtn.className = 'btn btn--ghost btn--sm btn--danger-text'
  deleteBtn.textContent = 'Delete'
  deleteBtn.setAttribute('aria-label', `Delete note ${note.id}`)
  deleteBtn.addEventListener('click', () => {
    showConfirmDelete(note.id)
  })
  actions.appendChild(deleteBtn)

  card.appendChild(actions)
  return card
}

export async function refreshNotes(): Promise<void> {
  const container = el<HTMLDivElement>('note-container')
  const countEl = el<HTMLSpanElement>('notes-count')

  try {
    const notes = currentQuery ? await searchNotes(currentQuery) : await listNotes()
    container.innerHTML = ''

    if (notes.length === 0) {
      const empty = document.createElement('p')
      empty.className = 'empty-state'
      empty.setAttribute('aria-hidden', 'true')
      empty.textContent = currentQuery ? 'No notes match your search.' : 'No notes yet. Write something above and click Save Note.'
      container.appendChild(empty)
    }

    for (const note of notes) {
      container.appendChild(createNoteCard(note))
    }

    countEl.textContent = `${notes.length} note${notes.length !== 1 ? 's' : ''}`
  } catch (err) {
    showToast(`Failed to load notes: ${err instanceof Error ? err.message : err}`, 'error')
  }
}

export function initNoteList(): void {
  refreshNotes()

  el<HTMLButtonElement>('search-btn').addEventListener('click', () => {
    const bar = el<HTMLDivElement>('search-bar')
    bar.classList.toggle('hidden')
    if (!bar.classList.contains('hidden')) {
      el<HTMLInputElement>('search-input').focus()
    } else {
      currentQuery = ''
      el<HTMLInputElement>('search-input').value = ''
      refreshNotes()
    }
  })

  el<HTMLInputElement>('search-input').addEventListener('input', () => {
    currentQuery = el<HTMLInputElement>('search-input').value
    refreshNotes()
  })

  el<HTMLButtonElement>('search-clear-btn').addEventListener('click', () => {
    el<HTMLInputElement>('search-input').value = ''
    currentQuery = ''
    refreshNotes()
  })
}

export async function handleDeleteNote(noteId: string): Promise<void> {
  try {
    await dbDelete(noteId)
    await refreshNotes()
    showToast('Note deleted')
  } catch (err) {
    showToast(`Failed to delete: ${err instanceof Error ? err.message : err}`, 'error')
  }
}
