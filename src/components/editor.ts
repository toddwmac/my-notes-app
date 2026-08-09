import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { showToast } from './toast'
import { saveNote, updateNote } from '../db'
import { notify } from '../state'

let isSaving = false
let editingNoteId: string | null = null

function el<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T
}

function renderMarkdown(text: string): string {
  const raw = marked.parse(text, { async: false }) as string
  return DOMPurify.sanitize(raw)
}

function updatePreview(): void {
  const input = el<HTMLTextAreaElement>('note-input')
  const display = el<HTMLDivElement>('markdown-display')
  const text = input.value
  if (text.trim()) {
    display.innerHTML = renderMarkdown(text)
  } else {
    display.innerHTML = '<p class="preview-placeholder">Start typing to see markdown preview…</p>'
  }
}

function resetEditor(): void {
  const input = el<HTMLTextAreaElement>('note-input')
  input.value = ''
  editingNoteId = null
  el<HTMLButtonElement>('edit-note-btn').classList.add('hidden')
  updatePreview()
}

async function handleSave(): Promise<void> {
  if (isSaving) return

  const input = el<HTMLTextAreaElement>('note-input')
  const text = input.value.trim()

  if (!text) {
    showToast('Please enter some text', 'error')
    return
  }

  isSaving = true
  const saveBtn = el<HTMLButtonElement>('save-btn')
  saveBtn.disabled = true
  saveBtn.setAttribute('aria-busy', 'true')

  try {
    if (editingNoteId) {
      await updateNote(editingNoteId, text)
      showToast('Note updated')
      resetEditor()
    } else {
      await saveNote({
        id: crypto.randomUUID(),
        text,
        createdAt: Date.now(),
      })
      showToast('Note saved')
      input.value = ''
      updatePreview()
    }
    notify()
  } catch (err) {
    showToast(`Failed to save: ${err instanceof Error ? err.message : err}`, 'error')
  } finally {
    isSaving = false
    saveBtn.disabled = false
    saveBtn.removeAttribute('aria-busy')
  }
}

export function setEditingNote(id: string, text: string): void {
  const input = el<HTMLTextAreaElement>('note-input')
  input.value = text
  editingNoteId = id
  el<HTMLButtonElement>('edit-note-btn').classList.remove('hidden')
  updatePreview()
  input.focus()
}

function wrapText(before: string, after: string, defaultText: string): void {
  const input = el<HTMLTextAreaElement>('note-input')
  const start = input.selectionStart
  const end = input.selectionEnd
  const beforeSelection = input.value.substring(0, start)
  const afterSelection = input.value.substring(end)

  if (start === end) {
    const insert = before + defaultText + after
    input.value = beforeSelection + insert + afterSelection
    input.focus()
    input.setSelectionRange(start + before.length, start + before.length + defaultText.length)
  } else {
    const selected = input.value.substring(start, end).trim()
    const leading = input.value.substring(start, end).match(/^\s*/)?.[0].length ?? 0
    const trailing = input.value.substring(start, end).match(/\s*$/)?.[0].length ?? 0
    const adjustedStart = start + leading
    const adjustedEnd = end - trailing
    const newBefore = beforeSelection + input.value.substring(start, adjustedStart)
    const newAfter = input.value.substring(adjustedEnd, end) + afterSelection

    const checkBefore = input.value.substring(Math.max(0, adjustedStart - before.length), adjustedStart)
    const checkAfter = input.value.substring(adjustedEnd, Math.min(input.value.length, adjustedEnd + after.length))

    if (checkBefore === before && checkAfter === after) {
      input.value = newBefore.substring(0, newBefore.length - before.length) + selected + newAfter.substring(after.length)
      input.focus()
      input.setSelectionRange(adjustedStart - before.length, adjustedEnd - before.length)
    } else {
      input.value = newBefore + before + selected + after + newAfter
      input.focus()
      input.setSelectionRange(newBefore.length + before.length, newBefore.length + before.length + selected.length)
    }
  }
  updatePreview()
}

function wrapLineInHeader(level: number): void {
  const input = el<HTMLTextAreaElement>('note-input')
  const start = input.selectionStart
  const lineStart = input.value.lastIndexOf('\n', start - 1) + 1
  const lineEnd = input.value.indexOf('\n', start)
  const actualLineEnd = lineEnd === -1 ? input.value.length : lineEnd
  const currentLine = input.value.substring(lineStart, actualLineEnd)
  const prefix = '#'.repeat(level) + ' '

  if (currentLine.startsWith(prefix)) {
    input.value = input.value.substring(0, lineStart) + currentLine.substring(prefix.length) + input.value.substring(actualLineEnd)
  } else {
    const existingMatch = currentLine.match(/^#+\s/)
    const replacement = existingMatch ? currentLine.replace(/^#+\s/, prefix) : prefix + currentLine
    input.value = input.value.substring(0, lineStart) + replacement + input.value.substring(actualLineEnd)
  }
  input.focus()
  updatePreview()
}

export function initEditor(): void {
  const input = el<HTMLTextAreaElement>('note-input')

  input.addEventListener('input', updatePreview)
  input.addEventListener('paste', () => setTimeout(updatePreview, 10))

  input.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    }
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault()
      el<HTMLButtonElement>('bold-btn').click()
    }
    if (e.ctrlKey && e.key === 'i') {
      e.preventDefault()
      el<HTMLButtonElement>('italic-btn').click()
    }
  })

  el<HTMLButtonElement>('save-btn').addEventListener('click', handleSave)
  el<HTMLButtonElement>('clear-btn').addEventListener('click', resetEditor)

  el<HTMLButtonElement>('bold-btn').addEventListener('click', () => wrapText('**', '**', 'bold text'))
  el<HTMLButtonElement>('italic-btn').addEventListener('click', () => wrapText('*', '*', 'italic text'))
  el<HTMLButtonElement>('strike-btn').addEventListener('click', () => wrapText('~~', '~~', 'strikethrough text'))
  el<HTMLButtonElement>('h1-btn').addEventListener('click', () => wrapLineInHeader(1))
  el<HTMLButtonElement>('h2-btn').addEventListener('click', () => wrapLineInHeader(2))
  el<HTMLButtonElement>('h3-btn').addEventListener('click', () => wrapLineInHeader(3))

  el<HTMLButtonElement>('paste-btn').addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text.trim()) {
        input.value = text.trim()
        updatePreview()
      }
    } catch {
      showToast('Unable to read clipboard', 'error')
    }
  })

  el<HTMLInputElement>('file-input').addEventListener('change', (evt) => {
    const file = (evt.target as HTMLInputElement).files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = (e.target?.result as string)?.trim()
      if (text) {
        input.value = text
        updatePreview()
      }
      ;(evt.target as HTMLInputElement).value = ''
    }
    reader.readAsText(file)
  })

  el<HTMLButtonElement>('load-file-btn').addEventListener('click', () => {
    el<HTMLInputElement>('file-input').click()
  })

  el<HTMLButtonElement>('select-all-input-btn').addEventListener('click', () => {
    input.focus()
    input.select()
    flashButton('select-all-input-btn')
  })

  el<HTMLButtonElement>('edit-note-btn').addEventListener('click', () => {
    if (editingNoteId) {
      resetEditor()
    }
  })

  updatePreview()
}

function flashButton(id: string): void {
  const btn = el<HTMLButtonElement>(id)
  const original = btn.textContent ?? ''
  btn.textContent = 'Selected!'
  btn.classList.add('btn--success')
  setTimeout(() => {
    btn.textContent = original
    btn.classList.remove('btn--success')
  }, 1500)
}
