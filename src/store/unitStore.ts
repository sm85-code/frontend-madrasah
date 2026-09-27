import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UnitState {
  selectedUnitId: string | null
  setSelectedUnitId: (id: string | null) => void
}

/** Pemilih unit untuk admin utama / yayasan. null = semua unit. */
export const useUnitStore = create<UnitState>()(
  persist(
    (set) => ({
      selectedUnitId: null,
      setSelectedUnitId: (selectedUnitId) => set({ selectedUnitId }),
    }),
    { name: 'madrasah-unit-scope' },
  ),
)
