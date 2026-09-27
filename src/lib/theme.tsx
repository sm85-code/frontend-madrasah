import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

/** Adapted from frontend-siabumdes's "Tampilan" (Appearance) popover --
 * trimmed to what fits a formal school portal: color theme presets and a
 * light/dark mode toggle. Left out on purpose: siabumdes's font switcher
 * (8 typefaces) and decorative wallpapers (Magic UI dot-grid/ripple/aurora
 * animations) -- neither suits an admin-heavy school system, and the
 * wallpapers pull in a whole extra component library for a formal UI that
 * doesn't want floating gradient blobs behind its data tables. */
export const COLOR_THEMES = [
  { id: 'teal', label: 'Teal (default)' },
  { id: 'blue', label: 'Biru' },
  { id: 'violet', label: 'Violet' },
  { id: 'amber', label: 'Amber' },
] as const

export const MODES = [
  { id: 'light', label: 'Terang' },
  { id: 'dark', label: 'Gelap' },
] as const

export type ColorTheme = (typeof COLOR_THEMES)[number]['id']
export type Mode = (typeof MODES)[number]['id']

const THEME_KEY = 'madrasah-color-theme'
const MODE_KEY = 'madrasah-mode'
const VALID_THEMES = COLOR_THEMES.map((t) => t.id) as string[]
const VALID_MODES = MODES.map((m) => m.id) as string[]

function readStored<T extends string>(key: string, validIds: string[], fallback: T): T {
  try {
    const stored = localStorage.getItem(key)
    return stored && validIds.includes(stored) ? (stored as T) : fallback
  } catch {
    return fallback
  }
}

interface ThemeContextValue {
  colorTheme: ColorTheme
  setColorTheme: (t: ColorTheme) => void
  mode: Mode
  setMode: (m: Mode) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  colorTheme: 'teal',
  setColorTheme: () => {},
  mode: 'light',
  setMode: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => readStored(THEME_KEY, VALID_THEMES, 'teal'))
  const [mode, setMode] = useState<Mode>(() => readStored(MODE_KEY, VALID_MODES, 'light'))

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', colorTheme)
    try {
      localStorage.setItem(THEME_KEY, colorTheme)
    } catch {
      // Private mode / storage blocked -- theme just resets next visit.
    }
  }, [colorTheme])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark')
    try {
      localStorage.setItem(MODE_KEY, mode)
    } catch {
      // Private mode / storage blocked -- mode just resets next visit.
    }
  }, [mode])

  return <ThemeContext.Provider value={{ colorTheme, setColorTheme, mode, setMode }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
