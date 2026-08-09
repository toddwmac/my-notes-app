export function initMarkdownHelp(): void {
  const modal = document.getElementById('markdown-help-modal')
  const helpBtn = document.getElementById('markdown-help-btn')
  const closeBtn = modal?.querySelector('.modal-close')

  if (!modal || !helpBtn) return

  helpBtn.addEventListener('click', (e) => {
    e.preventDefault()
    modal.hidden = false
    modal.style.display = 'block'
    modal.setAttribute('aria-modal', 'true')
    setTimeout(() => {
      (closeBtn as HTMLButtonElement)?.focus()
    }, 100)
  })

  const close = () => {
    modal.hidden = true
    modal.style.display = 'none'
    modal.removeAttribute('aria-modal')
  }

  closeBtn?.addEventListener('click', close)

  window.addEventListener('click', (e) => {
    if (e.target === modal) close()
  })

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') close()
  })
}
