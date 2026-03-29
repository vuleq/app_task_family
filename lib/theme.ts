'use client'

import { useState, useEffect } from 'react'

export type ThemeId = 'classic' | 'disney' | 'universe' | 'city'

export interface Theme {
  id: ThemeId
  label: string
  emoji: string
  /** Two-stop preview for the swatch */
  swatch: [string, string]
  background: string
}

export const THEMES: Theme[] = [
  {
    id: 'classic',
    label: 'Classic',
    emoji: '🌸',
    swatch: ['#ede9fe', '#f5f3ff'],
    background: 'linear-gradient(145deg, #f5f3ff 0%, #ede9fe 40%, #faf5ff 80%, #f0ebff 100%)',
  },
  {
    id: 'disney',
    label: 'Disney',
    emoji: '🏰',
    swatch: ['#fce7f3', '#fef9c3'],
    background:
      'linear-gradient(145deg, #fff0f9 0%, #fce7f3 30%, #fef3c7 65%, #fdf4ff 100%)',
  },
  {
    id: 'universe',
    label: 'Universe',
    emoji: '🌌',
    swatch: ['#1e1b4b', '#4c1d95'],
    background:
      'linear-gradient(145deg, #0f0c29 0%, #1e1b4b 25%, #312e81 55%, #4c1d95 80%, #1e1b4b 100%)',
  },
  {
    id: 'city',
    label: 'City',
    emoji: '🏙️',
    swatch: ['#bfdbfe', '#e0f2fe'],
    background:
      'linear-gradient(145deg, #f0f9ff 0%, #dbeafe 35%, #e0f2fe 65%, #eff6ff 100%)',
  },
]

const STORAGE_KEY = 'app_theme'
const DEFAULT_THEME: ThemeId = 'classic'

export function getThemeById(id: ThemeId): Theme {
  return THEMES.find(t => t.id === id) ?? THEMES[0]
}

export function useTheme() {
  const [themeId, setThemeId] = useState<ThemeId>(DEFAULT_THEME)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null
    if (saved && THEMES.some(t => t.id === saved)) {
      setThemeId(saved)
    }
  }, [])

  const setTheme = (id: ThemeId) => {
    setThemeId(id)
    localStorage.setItem(STORAGE_KEY, id)
  }

  return { themeId, theme: getThemeById(themeId), setTheme }
}
