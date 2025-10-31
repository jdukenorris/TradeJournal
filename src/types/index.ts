export interface Trade {
  id: string
  tradeId: string
  symbol: string
  side: 'BUY' | 'SELL'
  qty: number
  entryTime: Date
  entryPrice: number
  exitTime: Date | null
  exitPrice: number | null
  pnl: number
  fees: number
  account: string
  strategyTags: string[]
  notes?: string
  syncedAt?: Date
  notionPageId?: string
}

export interface JournalEntry {
  id: string
  type: 'pre-market' | 'live-trade' | 'post-trade'
  content: string
  tradeId?: string
  mood?: string
  confidence: number // 1-5
  audioFileUrl?: string
  createdAt: Date
  notionPageId?: string
}

export interface RuleSet {
  id: string
  name: string
  allowedSessions: { start: string; end: string }[]
  maxRiskPerTrade: number // percentage
  allowedSetups: string[]
  allowedTickers: string[]
  doNotTradeTimes: { start: string; end: string }[]
  createdAt: Date
}

export interface FieldMapping {
  brokerField: string
  notionColumn: string | null
  confidence?: 'high' | 'medium' | 'low'
  isOptional: boolean
}

export interface MappingPreset {
  id: string
  name: string
  notionDatabaseId: string
  mappings: FieldMapping[]
  createdAt: Date
}

export interface WeeklySummary {
  id: string
  weekStart: Date
  weekEnd: Date
  tradesCount: number
  winRate: number
  avgRiskReward: number
  commonThemes: string[]
  aiSuggestions: string[]
  ruleBreaks: number
  createdAt: Date
  notionPageId?: string
}

export interface SyncEvent {
  id: string
  timestamp: Date
  source: 'broker' | 'notion' | 'manual'
  action: string
  result: 'success' | 'error'
  message: string
}

export interface BrokerConnection {
  id: string
  broker: 'tradovate' | 'ninjatrader' | 'other'
  apiKey?: string
  apiSecret?: string
  isConnected: boolean
  lastSyncAt?: Date
  createdAt: Date
}

export interface NotionConnection {
  id: string
  token: string
  isConnected: boolean
  lastTestAt?: Date
  createdAt: Date
}

export interface NotionDatabase {
  id: string
  name: string
  properties: Record<string, string> // property name -> type
}

