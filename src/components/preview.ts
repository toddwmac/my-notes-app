export function initPreview(): void {
  const display = document.getElementById('markdown-display')
  if (!display) return

  const selectAllBtn = document.getElementById('select-all-preview-btn')
  const copyHtmlBtn = document.getElementById('copy-html-btn')
  const copyFormattedBtn = document.getElementById('copy-formatted-btn')

  selectAllBtn?.addEventListener('click', () => {
    const selection = window.getSelection()
    const range = document.createRange()
    range.selectNodeContents(display)
    selection?.removeAllRanges()
    selection?.addRange(range)
    flashButton('select-all-preview-btn')
  })

  copyHtmlBtn?.addEventListener('click', async () => {
    const html = display.innerHTML
    if (html && !html.includes('preview-placeholder')) {
      try {
        await navigator.clipboard.writeText(html)
        flashButton('copy-html-btn', 'Copied!')
      } catch {
        fallbackCopy(html)
        flashButton('copy-html-btn', 'Copied!')
      }
    }
  })

  copyFormattedBtn?.addEventListener('click', async () => {
    const clone = display.cloneNode(true) as HTMLElement
    const tempDiv = document.createElement('div')
    tempDiv.style.position = 'absolute'
    tempDiv.style.left = '-9999px'
    tempDiv.appendChild(clone)
    document.body.appendChild(tempDiv)

    const selection = window.getSelection()
    const range = document.createRange()
    range.selectNodeContents(clone)
    selection?.removeAllRanges()
    selection?.addRange(range)

    try {
      const html = display.innerHTML
      const plain = display.textContent ?? ''
      const item = new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([plain], { type: 'text/plain' }),
      })
      await navigator.clipboard.write([item])
      flashButton('copy-formatted-btn', 'Copied!')
    } catch {
      fallbackCopy(display.textContent ?? '')
      flashButton('copy-formatted-btn', 'Copied!')
    } finally {
      selection?.removeAllRanges()
      document.body.removeChild(tempDiv)
    }
  })
}

function fallbackCopy(text: string): void {
  const ta = document.createElement('textarea')
  ta.value = text
  document.body.appendChild(ta)
  ta.select()
  document.execCommand('copy')
  document.body.removeChild(ta)
}

function flashButton(id: string, label = 'Selected!'): void {
  const btn = document.getElementById(id)
  if (!btn) return
  const original = btn.textContent ?? ''
  btn.textContent = label
  btn.classList.add('btn--success')
  setTimeout(() => {
    btn.textContent = original
    btn.classList.remove('btn--success')
  }, 1500)
}
