import type { ToastType } from '../types'

export function showToast(message: string, type: ToastType = 'info'): void {
  const existing = document.querySelector('.toast')
  if (existing) existing.remove()

  const toast = document.createElement('div')
  toast.className = `toast toast--${type}`
  toast.textContent = message
  toast.setAttribute('role', 'alert')
  toast.setAttribute('aria-live', 'polite')
  document.body.appendChild(toast)

  setTimeout(() => toast.remove(), 3000)
}
