import { Palette } from 'lucide-react'
import { COLOR_THEMES, MODES, useTheme } from '../lib/theme'
import { Button } from './ui/AppButton'
import { Label, Select } from './ui/AppInput'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

export function AppearancePopover({ triggerClassName }: { triggerClassName?: string }) {
  const { colorTheme, setColorTheme, mode, setMode } = useTheme()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={triggerClassName ?? 'gap-1.5'} aria-label="Tampilan">
          <Palette className="size-4" strokeWidth={2} />
          <span className="hidden sm:inline">Tampilan</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="space-y-3">
        <div>
          <Label htmlFor="appearance-theme">Tema Warna</Label>
          <Select id="appearance-theme" value={colorTheme} onChange={(e) => setColorTheme(e.target.value as typeof colorTheme)}>
            {COLOR_THEMES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
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
      </PopoverContent>
    </Popover>
  )
}
