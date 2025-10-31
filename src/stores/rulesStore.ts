import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { RuleSet } from '@/types'

interface RulesStore {
  rules: RuleSet[]
  activeRuleSetId: string | null
  setRules: (rules: RuleSet[]) => void
  addRule: (rule: RuleSet) => void
  setActiveRuleSet: (id: string | null) => void
}

export const useRulesStore = create<RulesStore>()(
  persist(
    (set) => ({
      rules: [],
      activeRuleSetId: null,
      setRules: (rules) => set({ rules }),
      addRule: (rule) => set((state) => ({ rules: [...state.rules, rule] })),
      setActiveRuleSet: (id) => set({ activeRuleSetId: id }),
    }),
    {
      name: 'rules-storage',
    }
  )
)

