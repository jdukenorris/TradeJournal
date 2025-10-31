import { create } from 'zustand'
import { BrokerConnection, NotionConnection } from '@/types'

interface ConnectionStore {
  broker: BrokerConnection | null
  notion: NotionConnection | null
  setBroker: (broker: BrokerConnection | null) => void
  setNotion: (notion: NotionConnection | null) => void
}

export const useConnectionStore = create<ConnectionStore>((set) => ({
  broker: null,
  notion: null,
  setBroker: (broker) => set({ broker }),
  setNotion: (notion) => set({ notion }),
}))

