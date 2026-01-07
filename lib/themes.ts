import { ThemeConfig, ThemePreset } from './database.types'

export const themes: Record<ThemePreset, ThemeConfig> = {
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    primaryColor: '#8B5CF6',
    backgroundColor: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 35.36%, #6D28D9 70.71%)',
    textColor: '#FFFFFF',
    accentColor: '#A78BFA',
    fontFamily: "'DM Sans', sans-serif",
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    primaryColor: '#0EA5E9',
    backgroundColor: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 35.36%, #0369A1 70.71%)',
    textColor: '#F0F9FF',
    accentColor: '#38BDF8',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    primaryColor: '#F97316',
    backgroundColor: 'linear-gradient(135deg, #F97316 0%, #EA580C 35.36%, #C2410C 70.71%)',
    textColor: '#FFFFFF',
    accentColor: '#FB923C',
    fontFamily: "'Outfit', sans-serif",
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    primaryColor: '#10B981',
    backgroundColor: 'linear-gradient(135deg, #10B981 0%, #059669 35.36%, #047857 70.71%)',
    textColor: '#ECFDF5',
    accentColor: '#34D399',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  lavender: {
    id: 'lavender',
    name: 'Lavender',
    primaryColor: '#A855F7',
    backgroundColor: 'linear-gradient(135deg, #A855F7 0%, #9333EA 35.36%, #7E22CE 70.71%)',
    textColor: '#FFFFFF',
    accentColor: '#C084FC',
    fontFamily: "'Sora', sans-serif",
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    primaryColor: '#3B82F6',
    backgroundColor: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 35.36%, #1E3A8A 70.71%)',
    textColor: '#FFFFFF',
    accentColor: '#60A5FA',
    fontFamily: "'Inter', sans-serif",
  },
}

export const themeList = Object.values(themes)

export function getTheme(preset: ThemePreset): ThemeConfig {
  return themes[preset] || themes.minimal
}

// Generate CSS variables from theme
export function getThemeCSSVariables(theme: ThemeConfig): React.CSSProperties {
  return {
    '--theme-primary': theme.primaryColor,
    '--theme-background': theme.backgroundColor,
    '--theme-text': theme.textColor,
    '--theme-accent': theme.accentColor,
    '--theme-font': theme.fontFamily,
  } as React.CSSProperties
}

// Generate gradient from a single color
export function generateGradientFromColor(color: string): string {
  // Convert hex to RGB to manipulate
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
  // Create darker variations
  const darken1 = (val: number) => Math.max(0, Math.floor(val * 0.85))
  const darken2 = (val: number) => Math.max(0, Math.floor(val * 0.6))
  
  const color1 = `rgb(${r}, ${g}, ${b})`
  const color2 = `rgb(${darken1(r)}, ${darken1(g)}, ${darken1(b)})`
  const color3 = `rgb(${darken2(r)}, ${darken2(g)}, ${darken2(b)})`
  
  return `linear-gradient(135deg, ${color1} 0%, ${color2} 35.36%, ${color3} 70.71%)`
}

