import { Trade } from '@/types'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const brokerClient = {
  async listRecentTrades(limit: number = 10): Promise<Trade[]> {
    await delay(600)
    // Return empty array - will be populated by seed data
    return []
  },

  async testConnection(broker: string, apiKey: string, apiSecret: string): Promise<boolean> {
    await delay(1500)
    return apiKey.length > 5 && apiSecret.length > 5
  },

  async syncTrades(): Promise<{ count: number; trades: Trade[] }> {
    await delay(2000)
    return {
      count: 0,
      trades: []
    }
  }
}

