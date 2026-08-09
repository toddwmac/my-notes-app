import './style.css'
import { initDarkMode } from './components/dark-mode'
import { initEditor } from './components/editor'
import { initNoteList, refreshNotes } from './components/note-list'
import { initDeleteModal } from './components/delete-modal'
import { initEditModal } from './components/edit-modal'
import { initPreview } from './components/preview'
import { initMarkdownHelp } from './components/markdown-help'
import { subscribe } from './state'

document.addEventListener('DOMContentLoaded', () => {
  initDarkMode()
  initEditor()
  initNoteList()
  initDeleteModal()
  initEditModal()
  initPreview()
  initMarkdownHelp()

  subscribe(() => {
    refreshNotes()
  })
})
