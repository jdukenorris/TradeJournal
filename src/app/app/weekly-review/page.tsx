'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { dataStore } from '@/lib/mocks/dataStore'
import { WeeklySummary } from '@/types'
import { toast } from 'sonner'
import { aiClient } from '@/lib/mocks/aiClient'
import { notionClient } from '@/lib/mocks/notionClient'
import { format, startOfWeek, endOfWeek } from 'date-fns'

export default function WeeklyReviewPage() {
  const [summary, setSummary] = useState<WeeklySummary | null>(null)
  const [generating, setGenerating] = useState(false)
  const [pushing, setPushing] = useState(false)

  const handleGenerateSummary = async () => {
    setGenerating(true)
    try {
      const trades = dataStore.trades.getAll()
      const journals = dataStore.journals.getAll()
      
      // Get this week's trades and journals
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })
      
      const weekTrades = trades.filter(t => {
        const date = new Date(t.entryTime)
        return date >= weekStart && date <= weekEnd
      })
      
      const weekJournals = journals.filter(j => {
        const date = new Date(j.createdAt)
        return date >= weekStart && date <= weekEnd
      })

      const aiSummary = await aiClient.summarizeWeek(weekTrades, weekJournals)

      const weeklySummary: WeeklySummary = {
        id: `weekly-${Date.now()}`,
        weekStart,
        weekEnd,
        tradesCount: aiSummary.tradesCount,
        winRate: aiSummary.winRate,
        avgRiskReward: aiSummary.avgRiskReward,
        commonThemes: aiSummary.commonThemes,
        aiSuggestions: aiSummary.suggestions,
        ruleBreaks: 2, // Mock
        createdAt: new Date(),
      }

      dataStore.weeklySummaries.add(weeklySummary)
      setSummary(weeklySummary)
      toast.success('Weekly summary generated')
    } catch (error) {
      toast.error('Failed to generate summary')
    } finally {
      setGenerating(false)
    }
  }

  const handlePushToNotion = async () => {
    if (!summary) return
    
    setPushing(true)
    try {
      const result = await notionClient.pushWeeklyReport(summary)
      toast.success(`Weekly report pushed to Notion: ${result.title}`)
    } catch (error) {
      toast.error('Failed to push to Notion')
    } finally {
      setPushing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Weekly Review</h1>
        <p className="text-muted-foreground">Generate and review your weekly trading summary</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Summary</CardTitle>
          <CardDescription>
            Week of {format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'MMM d')} - {format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'MMM d')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!summary ? (
            <Button onClick={handleGenerateSummary} disabled={generating}>
              {generating ? 'Generating...' : 'Generate Weekly Summary'}
            </Button>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-sm text-muted-foreground">Trades</div>
                  <div className="text-2xl font-bold">{summary.tradesCount}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Win Rate</div>
                  <div className="text-2xl font-bold">{summary.winRate}%</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Avg R/R</div>
                  <div className="text-2xl font-bold">{summary.avgRiskReward}</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Common Themes</h3>
                <ul className="list-disc list-inside space-y-1">
                  {summary.commonThemes.map((theme, i) => (
                    <li key={i} className="text-sm">{theme}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">AI Suggestions</h3>
                <ul className="list-disc list-inside space-y-1">
                  {summary.aiSuggestions.map((suggestion, i) => (
                    <li key={i} className="text-sm">{suggestion}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Rule Breaks</div>
                <div className="text-xl font-bold text-yellow-600">{summary.ruleBreaks}</div>
              </div>

              <Button onClick={handlePushToNotion} disabled={pushing} className="w-full">
                {pushing ? 'Pushing...' : 'Push to Notion'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

