import { Palette } from 'lucide-react'
import { BASE_COLORS, FONTS, MODES, THEMES, WALLPAPERS, useTheme } from '../lib/theme'
import { Button } from './ui/AppButton'
import { Label, Select } from './ui/AppInput'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

export function AppearancePopover({
  triggerClassName,
  align = 'end',
}: {
  triggerClassName?: string
  align?: 'start' | 'center' | 'end'
}) {
  const {
    font,
    setFont,
    colorTheme,
    setColorTheme,
    baseColor,
    setBaseColor,
    wallpaper,
    setWallpaper,
    mode,
    setMode,
  } = useTheme()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="sm" className={triggerClassName ?? 'gap-1.5'} aria-label="Tampilan">
          <Palette className="size-4" strokeWidth={2} />
          <span>Tampilan</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-64 space-y-3">
        <div>
          <Label htmlFor="appearance-theme">Tema</Label>
          <Select id="appearance-theme" value={colorTheme} onChange={(e) => setColorTheme(e.target.value as typeof colorTheme)}>
            {THEMES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="appearance-base">Base Warna</Label>
          <Select id="appearance-base" value={baseColor} onChange={(e) => setBaseColor(e.target.value as typeof baseColor)}>
            {BASE_COLORS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="appearance-wallpaper">Wallpaper</Label>
          <Select
            id="appearance-wallpaper"
            value={wallpaper}
            onChange={(e) => setWallpaper(e.target.value as typeof wallpaper)}
          >
            {WALLPAPERS.map((w) => (
              <option key={w.id} value={w.id}>
                {w.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="appearance-mode">Mode</Label>
          <Select id="appearance-mode" value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
            {MODES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="appearance-font">Font</Label>
          <Select id="appearance-font" value={font} onChange={(e) => setFont(e.target.value as typeof font)}>
            {FONTS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  )
}
