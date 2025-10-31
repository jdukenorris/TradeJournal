import { Trade, RuleSet, JournalEntry } from '@/types'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const aiClient = {
  async transcribeSpeech(audioBlob: Blob): Promise<{ text: string; cleanedText: string; audioUrl: string }> {
    await delay(2000)
    // Mock transcription with filler words
    const rawText = "Um, so like, I think that, you know, the market is looking pretty good today, um, and I'm feeling pretty confident about, uh, this trade."
    const cleanedText = rawText
      .replace(/\b(um|uh|like|you know|so)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
    
    return {
      text: rawText,
      cleanedText: cleanedText,
      audioUrl: `mock-audio-${Date.now()}.mp3`
    }
  },

  async summarizeWeek(trades: Trade[], journals: JournalEntry[]): Promise<{
    tradesCount: number
    winRate: number
    avgRiskReward: number
    commonThemes: string[]
    suggestions: string[]
  }> {
    await delay(1500)
    
    const winCount = trades.filter(t => t.pnl > 0).length
    const winRate = trades.length > 0 ? (winCount / trades.length) * 100 : 0
    
    // Mock analysis
    const themes = [
      'High confidence trades performed better',
      'Morning sessions showed consistent patterns',
      'Risk management improved over the week'
    ]
    
    const suggestions = [
      'Consider reducing position size during volatile periods',
      'Review entry timing - entries before 10 AM showed better outcomes',
      'Continue focusing on your proven setups'
    ]
    
    return {
      tradesCount: trades.length,
      winRate: Math.round(winRate * 10) / 10,
      avgRiskReward: 1.8,
      commonThemes: themes,
      suggestions
    }
  },

  async analyzeTradesAgainstRules(trades: Trade[], journals: JournalEntry[], rules: RuleSet): Promise<{
    violations: Array<{
      tradeId: string
      rule: string
      severity: 'high' | 'medium' | 'low'
      impact: number
    }>
    totalImpact: number
  }> {
    await delay(1200)
    
    const violations: Array<{
      tradeId: string
      rule: string
      severity: 'high' | 'medium' | 'low'
      impact: number
    }> = []
    
    // Mock rule checks
    trades.forEach(trade => {
      const entryHour = new Date(trade.entryTime).getHours()
      
      // Check time window violations
      if (entryHour >= 12) {
        violations.push({
          tradeId: trade.id,
          rule: 'Traded after 12:00 PM',
          severity: 'medium',
          impact: Math.abs(trade.pnl) * 0.1
        })
      }
      
      // Check risk per trade
      const riskPercent = (Math.abs(trade.pnl) / 10000) * 100 // Mock calculation
      if (riskPercent > rules.maxRiskPerTrade) {
        violations.push({
          tradeId: trade.id,
          rule: `Risk exceeded ${rules.maxRiskPerTrade}% limit`,
          severity: 'high',
          impact: Math.abs(trade.pnl) * 0.2
        })
      }
    })
    
    const totalImpact = violations.reduce((sum, v) => sum + v.impact, 0)
    
    return {
      violations,
      totalImpact: Math.round(totalImpact * 100) / 100
    }
  }
}

