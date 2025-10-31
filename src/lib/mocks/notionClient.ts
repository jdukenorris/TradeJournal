import { NotionDatabase, Trade, JournalEntry, WeeklySummary } from '@/types'

// Mock delay to simulate API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const notionClient = {
  async listDatabases(): Promise<NotionDatabase[]> {
    await delay(500)
    return [
      {
        id: 'db-1',
        name: 'Trading Journal',
        properties: {
          'Trade ID': 'title',
          'Symbol': 'select',
          'Side': 'select',
          'Quantity': 'number',
          'Entry Time': 'date',
          'Entry Price': 'number',
          'Exit Time': 'date',
          'Exit Price': 'number',
          'P&L': 'number',
          'Fees': 'number',
          'Account': 'select',
          'Strategy Tags': 'multi_select',
          'Notes': 'rich_text',
        }
      },
      {
        id: 'db-2',
        name: 'Trade Log',
        properties: {
          'ID': 'title',
          'Ticker': 'select',
          'Direction': 'select',
          'Size': 'number',
          'Entry': 'date',
          'Price': 'number',
        }
      },
      {
        id: 'db-3',
        name: 'Trades',
        properties: {
          'Trade': 'title',
          'Stock': 'select',
          'Type': 'select',
          'Qty': 'number',
          'Entry': 'date',
          'Exit': 'date',
          'Profit': 'number',
        }
      }
    ]
  },

  async pushTrade(trade: Trade): Promise<{ pageId: string; title: string }> {
    await delay(800)
    const pageId = `notion-page-${Date.now()}`
    return {
      pageId,
      title: `${trade.symbol} ${trade.side} - ${trade.tradeId}`
    }
  },

  async pushJournal(entry: JournalEntry): Promise<{ pageId: string; title: string }> {
    await delay(800)
    const pageId = `notion-journal-${Date.now()}`
    return {
      pageId,
      title: `${entry.type.replace('-', ' ')} - ${new Date(entry.createdAt).toLocaleDateString()}`
    }
  },

  async pushWeeklyReport(summary: WeeklySummary): Promise<{ pageId: string; title: string }> {
    await delay(1000)
    const pageId = `notion-weekly-${Date.now()}`
    return {
      pageId,
      title: `Weekly Review - ${summary.weekStart.toLocaleDateString()}`
    }
  },

  async testConnection(token: string): Promise<boolean> {
    await delay(1000)
    return token.length > 10 // Simple validation
  }
}

