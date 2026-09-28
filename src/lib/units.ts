/** Preferred display order for Bani Husen jenjang (landing + portal). */
const UNIT_ORDER = [
  'tpq',
  'pra-diniyah',
  'pra diniyah',
  'pradiniyah',
  'diniyah ula',
  'ula',
  'diniyah wustho',
  'wustho',
] as const

type UnitNameFields = { nama?: string | null; unit_nama?: string | null }

function normalizeUnitName(nama: string): string {
  return nama.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Resolve display name from public (`nama`) or rekap (`unit_nama`) shapes. */
export function unitDisplayName(unit: UnitNameFields): string {
  return (unit.nama ?? unit.unit_nama ?? '').trim()
}

function unitSortKey(nama: string): number {
  const n = normalizeUnitName(nama)
  if (!n) return 100
  const exact = UNIT_ORDER.indexOf(n as (typeof UNIT_ORDER)[number])
  if (exact >= 0) {
    // Collapse pra-diniyah aliases with TPQ (index 0)
    if (exact <= 3) return 0
    if (exact <= 5) return 1
    return 2
  }
  // Fuzzy: Pra-Diniyah / TPQ first, then Ula, then Wustho
  if (
    /\btpq\b/.test(n) ||
    n.includes('taman pendidikan') ||
    /\bpra[\s-]?diniyah\b/.test(n) ||
    /\bpradiniyah\b/.test(n)
  ) {
    return 0
  }
  if (/\bula\b/.test(n)) return 1
  if (/\bwustho\b/.test(n) || /\bwust[aā]\b/.test(n)) return 2
  return 100
}

/** Sort units: Pra-Diniyah (TPQ) → Diniyah Ula → Diniyah Wustho, then others by name. */
export function sortUnitsByJenjang<T extends UnitNameFields>(units: T[]): T[] {
  return [...units].sort((a, b) => {
    const na = unitDisplayName(a)
    const nb = unitDisplayName(b)
    const ka = unitSortKey(na)
    const kb = unitSortKey(nb)
    if (ka !== kb) return ka - kb
    return na.localeCompare(nb, 'id')
  })
}
