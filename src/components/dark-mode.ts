function el<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T
}

export function initDarkMode(): void {
  const toggle = el<HTMLButtonElement>('dark-mode-toggle')
  const html = document.documentElement
  const saved = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  if (saved === 'dark' || (!saved && prefersDark)) {
    html.setAttribute('data-color-scheme', 'dark')
    toggle.textContent = 'Light'
    toggle.setAttribute('aria-pressed', 'true')
  }

  toggle.addEventListener('click', () => {
    const isDark = html.getAttribute('data-color-scheme') === 'dark'
    if (isDark) {
      html.removeAttribute('data-color-scheme')
      toggle.textContent = 'Dark'
      toggle.setAttribute('aria-pressed', 'false')
      localStorage.setItem('theme', 'light')
    } else {
      html.setAttribute('data-color-scheme', 'dark')
      toggle.textContent = 'Light'
      toggle.setAttribute('aria-pressed', 'true')
      localStorage.setItem('theme', 'dark')
    }
  })
}
