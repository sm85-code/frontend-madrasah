/** Preferred public display order for Bani Husen jenjang. */
const UNIT_ORDER = ['tpq', 'diniyah ula', 'ula', 'diniyah wustho', 'wustho'] as const

function normalizeUnitName(nama: string): string {
  return nama.trim().toLowerCase().replace(/\s+/g, ' ')
}

function unitSortKey(nama: string): number {
  const n = normalizeUnitName(nama)
  const exact = UNIT_ORDER.indexOf(n as (typeof UNIT_ORDER)[number])
  if (exact >= 0) return exact
  // Fuzzy: TPQ first, then Ula, then Wustho
  if (/\btpq\b/.test(n) || n.includes('taman pendidikan')) return 0
  if (/\bula\b/.test(n)) return 1
  if (/\bwustho\b/.test(n) || /\bwust[aā]\b/.test(n)) return 2
  return 100
}

/** Sort units: TPQ → Diniyah Ula → Diniyah Wustho, then others by name. */
export function sortUnitsByJenjang<T extends { nama: string }>(units: T[]): T[] {
  return [...units].sort((a, b) => {
    const ka = unitSortKey(a.nama)
    const kb = unitSortKey(b.nama)
    if (ka !== kb) return ka - kb
    return a.nama.localeCompare(b.nama, 'id')
  })
}
