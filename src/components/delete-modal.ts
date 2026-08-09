import { showToast } from './toast'
import { handleDeleteNote, refreshNotes } from './note-list'
import { subscribe, notify } from '../state'

let pendingDeleteId: string | null = null

function el<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T
}

export function showConfirmDelete(noteId: string): void {
  pendingDeleteId = noteId
  const modal = el<HTMLElement>('confirm-delete-modal')
  const idSpan = modal.querySelector('.confirm-note-id')
  if (idSpan) idSpan.textContent = noteId
  modal.hidden = false
  modal.style.display = 'flex'
  modal.setAttribute('aria-modal', 'true')
  setTimeout(() => {
    modal.querySelector<HTMLButtonElement>('.confirm-modal-close')?.focus()
  }, 100)
}

function closeModal(): void {
  const modal = el<HTMLElement>('confirm-delete-modal')
  modal.hidden = true
  modal.style.display = 'none'
  modal.removeAttribute('aria-modal')
  pendingDeleteId = null
}

export function initDeleteModal(): void {
  const modal = el<HTMLElement>('confirm-delete-modal')

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal()
  })

  modal.querySelector('.confirm-modal-close')?.addEventListener('click', closeModal)
  modal.querySelector('.confirm-modal-cancel')?.addEventListener('click', closeModal)
  modal.querySelector('.confirm-modal-confirm')?.addEventListener('click', async () => {
    if (!pendingDeleteId) return
    const id = pendingDeleteId
    closeModal()
    await handleDeleteNote(id)
  })

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      closeModal()
    }
  })
}
