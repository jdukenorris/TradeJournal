import { Trade, JournalEntry, SyncEvent, WeeklySummary } from '@/types'

// Seed data store
const seedTrades: Trade[] = [
  {
    id: '1',
    tradeId: 'T-001',
    symbol: 'AAPL',
    side: 'BUY',
    qty: 100,
    entryTime: new Date('2024-01-15T09:30:00'),
    entryPrice: 150.25,
    exitTime: new Date('2024-01-15T15:45:00'),
    exitPrice: 152.80,
    pnl: 255,
    fees: 1.50,
    account: 'Main',
    strategyTags: ['Momentum', 'Breakout'],
    notes: 'Strong volume breakout',
    syncedAt: new Date('2024-01-15T16:00:00'),
  },
  {
    id: '2',
    tradeId: 'T-002',
    symbol: 'TSLA',
    side: 'SELL',
    qty: 50,
    entryTime: new Date('2024-01-15T10:15:00'),
    entryPrice: 245.50,
    exitTime: new Date('2024-01-15T11:30:00'),
    exitPrice: 243.20,
    pnl: 115,
    fees: 1.25,
    account: 'Main',
    strategyTags: ['Reversal', 'Short'],
    notes: 'Quick scalp trade',
    syncedAt: new Date('2024-01-15T11:35:00'),
  },
  {
    id: '3',
    tradeId: 'T-003',
    symbol: 'MSFT',
    side: 'BUY',
    qty: 75,
    entryTime: new Date('2024-01-16T09:45:00'),
    entryPrice: 380.00,
    exitTime: new Date('2024-01-16T14:20:00'),
    exitPrice: 378.50,
    pnl: -112.50,
    fees: 1.75,
    account: 'Main',
    strategyTags: ['Trend', 'Long'],
    notes: 'Failed to break resistance',
    syncedAt: new Date('2024-01-16T14:25:00'),
  },
  {
    id: '4',
    tradeId: 'T-004',
    symbol: 'GOOGL',
    side: 'BUY',
    qty: 25,
    entryTime: new Date('2024-01-16T11:00:00'),
    entryPrice: 142.00,
    exitTime: new Date('2024-01-16T15:00:00'),
    exitPrice: 144.50,
    pnl: 62.50,
    fees: 0.75,
    account: 'Main',
    strategyTags: ['Breakout'],
    syncedAt: new Date('2024-01-16T15:05:00'),
  },
  {
    id: '5',
    tradeId: 'T-005',
    symbol: 'NVDA',
    side: 'BUY',
    qty: 30,
    entryTime: new Date('2024-01-17T09:30:00'),
    entryPrice: 485.00,
    exitTime: new Date('2024-01-17T12:15:00'),
    exitPrice: 492.50,
    pnl: 225,
    fees: 1.00,
    account: 'Main',
    strategyTags: ['Momentum', 'AI'],
    notes: 'AI sector strength',
    syncedAt: new Date('2024-01-17T12:20:00'),
  },
]

const seedJournals: JournalEntry[] = [
  {
    id: 'j1',
    type: 'pre-market',
    content: 'Market looks strong today. Focus on momentum plays in tech sector. Key levels: AAPL above 150, TSLA watching 245 support.',
    confidence: 4,
    createdAt: new Date('2024-01-15T08:30:00'),
  },
  {
    id: 'j2',
    type: 'live-trade',
    content: 'Entered AAPL long position. Volume confirming the breakout. Stop loss at 149.50.',
    tradeId: '1',
    mood: 'confident',
    confidence: 4,
    createdAt: new Date('2024-01-15T09:35:00'),
  },
  {
    id: 'j3',
    type: 'post-trade',
    content: 'Good trade on AAPL. Followed the plan, took profits at target. Need to review MSFT trade - entered too early.',
    tradeId: '3',
    mood: 'reflective',
    confidence: 3,
    createdAt: new Date('2024-01-16T16:00:00'),
  },
]

const seedSyncEvents: SyncEvent[] = [
  {
    id: 'e1',
    timestamp: new Date('2024-01-15T16:00:00'),
    source: 'broker',
    action: 'sync_trades',
    result: 'success',
    message: 'Synced 2 trades from Tradovate',
  },
  {
    id: 'e2',
    timestamp: new Date('2024-01-16T14:25:00'),
    source: 'broker',
    action: 'sync_trades',
    result: 'success',
    message: 'Synced 2 trades from Tradovate',
  },
  {
    id: 'e3',
    timestamp: new Date('2024-01-17T12:20:00'),
    source: 'manual',
    action: 'push_trade',
    result: 'success',
    message: 'Pushed trade T-005 to Notion',
  },
  {
    id: 'e4',
    timestamp: new Date('2024-01-17T10:00:00'),
    source: 'notion',
    action: 'push_journal',
    result: 'success',
    message: 'Created journal entry in Notion',
  },
]

// In-memory stores
let tradesStore: Trade[] = [...seedTrades]
let journalsStore: JournalEntry[] = [...seedJournals]
let syncEventsStore: SyncEvent[] = [...seedSyncEvents]
let weeklySummariesStore: WeeklySummary[] = []

export const dataStore = {
  trades: {
    getAll: () => tradesStore,
    getRecent: (limit: number = 10) => tradesStore.slice(0, limit),
    add: (trade: Trade) => {
      tradesStore = [trade, ...tradesStore]
      return trade
    },
    getById: (id: string) => tradesStore.find(t => t.id === id),
  },
  journals: {
    getAll: () => journalsStore,
    add: (entry: JournalEntry) => {
      journalsStore = [entry, ...journalsStore]
      return entry
    },
  },
  syncEvents: {
    getAll: () => syncEventsStore,
    add: (event: SyncEvent) => {
      syncEventsStore = [event, ...syncEventsStore]
      return event
    },
  },
  weeklySummaries: {
    getAll: () => weeklySummariesStore,
    add: (summary: WeeklySummary) => {
      weeklySummariesStore = [summary, ...weeklySummariesStore]
      return summary
    },
  },
}

// Seed function for demo mode
export const seedDemoData = () => {
  if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
    tradesStore = [...seedTrades]
    journalsStore = [...seedJournals]
    syncEventsStore = [...seedSyncEvents]
  }
}

