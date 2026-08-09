import { getNote, updateNote } from '../db'
import { notify } from '../state'
import { showToast } from './toast'
import { refreshNotes } from './note-list'
import { showConfirmDelete } from './delete-modal'
import DOMPurify from 'dompurify'
import { marked } from 'marked'

let editingNoteId: string | null = null

function el<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T
}

function renderMarkdown(text: string): string {
  const raw = marked.parse(text, { async: false }) as string
  return DOMPurify.sanitize(raw)
}

function updateEditPreview(): void {
  const input = el<HTMLTextAreaElement>('edit-note-input')
  const preview = el<HTMLDivElement>('edit-preview-display')
  const text = input.value
  if (text.trim()) {
    preview.innerHTML = renderMarkdown(text)
  } else {
    preview.innerHTML = '<p class="preview-placeholder">Preview appears here…</p>'
  }
}

export async function openEditModal(noteId: string): Promise<void> {
  const note = await getNote(noteId)
  if (!note) {
    showToast('Note not found', 'error')
    return
  }

  editingNoteId = noteId
  const modal = el<HTMLElement>('edit-modal')
  const input = el<HTMLTextAreaElement>('edit-note-input')

  input.value = note.text
  updateEditPreview()

  modal.hidden = false
  modal.style.display = 'flex'
  modal.setAttribute('aria-modal', 'true')

  setTimeout(() => {
    input.focus()
  }, 100)
}

function closeModal(): void {
  const modal = el<HTMLElement>('edit-modal')
  modal.hidden = true
  modal.style.display = 'none'
  modal.removeAttribute('aria-modal')
  editingNoteId = null
}

export function initEditModal(): void {
  const modal = el<HTMLElement>('edit-modal')
  const input = el<HTMLTextAreaElement>('edit-note-input')

  input.addEventListener('input', updateEditPreview)

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal()
  })

  modal.querySelector('.modal-close')?.addEventListener('click', closeModal)

  modal.querySelector('.edit-modal-cancel')?.addEventListener('click', closeModal)

  modal.querySelector('.edit-modal-save')?.addEventListener('click', async () => {
    if (!editingNoteId) return
    const text = input.value.trim()
    if (!text) {
      showToast('Note text cannot be empty', 'error')
      return
    }
    const updated = await updateNote(editingNoteId, text)
    if (updated) {
      closeModal()
      notify()
      await refreshNotes()
      showToast('Note updated')
    } else {
      showToast('Failed to update note', 'error')
    }
  })

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      closeModal()
    }
  })
}
