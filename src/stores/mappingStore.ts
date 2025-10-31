import { create } from 'zustand'
import { FieldMapping, MappingPreset } from '@/types'

interface MappingStore {
  currentMappings: FieldMapping[]
  selectedDatabaseId: string | null
  presets: MappingPreset[]
  setMappings: (mappings: FieldMapping[]) => void
  setSelectedDatabase: (id: string | null) => void
  savePreset: (name: string) => void
  loadPreset: (id: string) => void
  resetMappings: () => void
}

const defaultMappings: FieldMapping[] = [
  { brokerField: 'Trade ID', notionColumn: null, isOptional: false },
  { brokerField: 'Symbol', notionColumn: null, isOptional: false },
  { brokerField: 'Side', notionColumn: null, isOptional: false },
  { brokerField: 'Qty', notionColumn: null, isOptional: false },
  { brokerField: 'Entry Time', notionColumn: null, isOptional: false },
  { brokerField: 'Entry Price', notionColumn: null, isOptional: false },
  { brokerField: 'Exit Time', notionColumn: null, isOptional: false },
  { brokerField: 'Exit Price', notionColumn: null, isOptional: false },
  { brokerField: 'P&L', notionColumn: null, isOptional: false },
  { brokerField: 'Fees', notionColumn: null, isOptional: true },
  { brokerField: 'Account', notionColumn: null, isOptional: true },
  { brokerField: 'Strategy Tags', notionColumn: null, isOptional: true },
  { brokerField: 'Notes', notionColumn: null, isOptional: true },
]

export const useMappingStore = create<MappingStore>((set, get) => ({
  currentMappings: defaultMappings,
  selectedDatabaseId: null,
  presets: [],
  setMappings: (mappings) => set({ currentMappings: mappings }),
  setSelectedDatabase: (id) => set({ selectedDatabaseId: id }),
  savePreset: (name) => {
    const { currentMappings, selectedDatabaseId } = get()
    if (!selectedDatabaseId) return
    
    const preset: MappingPreset = {
      id: `preset-${Date.now()}`,
      name,
      notionDatabaseId: selectedDatabaseId,
      mappings: currentMappings,
      createdAt: new Date()
    }
    
    set((state) => ({
      presets: [...state.presets, preset]
    }))
  },
  loadPreset: (id) => {
    const preset = get().presets.find(p => p.id === id)
    if (preset) {
      set({
        currentMappings: preset.mappings,
        selectedDatabaseId: preset.notionDatabaseId
      })
    }
  },
  resetMappings: () => set({ currentMappings: defaultMappings }),
}))

