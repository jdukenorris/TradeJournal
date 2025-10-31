'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useRulesStore } from '@/stores/rulesStore'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { RuleSet } from '@/types'
import { toast } from 'sonner'
import { aiClient } from '@/lib/mocks/aiClient'
import { dataStore } from '@/lib/mocks/dataStore'

const ruleSchema = z.object({
  name: z.string().min(1),
  maxRiskPerTrade: z.number().min(0).max(100),
  allowedSetups: z.string(),
  allowedTickers: z.string(),
})

type RuleFormData = z.infer<typeof ruleSchema>

export default function RulesPage() {
  const { rules, addRule, activeRuleSetId, setActiveRuleSet } = useRulesStore()
  const [violations, setViolations] = useState<Array<{
    tradeId: string
    rule: string
    severity: 'high' | 'medium' | 'low'
    impact: number
  }>>([])
  const [checking, setChecking] = useState(false)
  const { register, handleSubmit, reset } = useForm<RuleFormData>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      name: 'Default Rules',
      maxRiskPerTrade: 2,
      allowedSetups: '',
      allowedTickers: '',
    },
  })

  useEffect(() => {
    if (rules.length > 0 && !activeRuleSetId) {
      setActiveRuleSet(rules[0].id)
    }
  }, [rules, activeRuleSetId, setActiveRuleSet])

  const onSubmit = (data: RuleFormData) => {
    const ruleSet: RuleSet = {
      id: `rule-${Date.now()}`,
      name: data.name,
      allowedSessions: [{ start: '09:30', end: '16:00' }],
      maxRiskPerTrade: data.maxRiskPerTrade,
      allowedSetups: data.allowedSetups.split(',').map(s => s.trim()).filter(Boolean),
      allowedTickers: data.allowedTickers.split(',').map(t => t.trim()).filter(Boolean),
      doNotTradeTimes: [{ start: '12:00', end: '13:00' }],
      createdAt: new Date(),
    }
    addRule(ruleSet)
    setActiveRuleSet(ruleSet.id)
    reset()
    toast.success('Rules saved')
  }

  const handleCheckRules = async () => {
    if (!activeRuleSetId) {
      toast.error('Please create a rule set first')
      return
    }

    setChecking(true)
    try {
      const ruleSet = rules.find(r => r.id === activeRuleSetId)
      if (!ruleSet) return

      const trades = dataStore.trades.getAll()
      const journals = dataStore.journals.getAll()
      
      const result = await aiClient.analyzeTradesAgainstRules(trades, journals, ruleSet)
      setViolations(result.violations)
      toast.success(`Found ${result.violations.length} violations`)
    } catch (error) {
      toast.error('Failed to check rules')
    } finally {
      setChecking(false)
    }
  }

  const activeRule = rules.find(r => r.id === activeRuleSetId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rules & Strategy</h1>
        <p className="text-muted-foreground">Define trading rules and check for violations</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Define Rules</CardTitle>
            <CardDescription>Set your trading rules and constraints</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Rule Set Name</Label>
                <Input id="name" {...register('name')} placeholder="Default Rules" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxRiskPerTrade">Max Risk Per Trade (%)</Label>
                <Input
                  id="maxRiskPerTrade"
                  type="number"
                  {...register('maxRiskPerTrade', { valueAsNumber: true })}
                  placeholder="2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowedSetups">Allowed Setups (comma-separated)</Label>
                <Input
                  id="allowedSetups"
                  {...register('allowedSetups')}
                  placeholder="Momentum, Breakout, Reversal"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowedTickers">Allowed Tickers (comma-separated)</Label>
                <Input
                  id="allowedTickers"
                  {...register('allowedTickers')}
                  placeholder="AAPL, TSLA, MSFT"
                />
              </div>

              <Button type="submit" className="w-full">Save Rules</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rule Check</CardTitle>
            <CardDescription>Check trades against your rules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeRule && (
              <div className="rounded-lg bg-muted p-4">
                <div className="text-sm font-medium mb-1">Active Rule Set</div>
                <div className="text-sm text-muted-foreground">{activeRule.name}</div>
              </div>
            )}
            <Button onClick={handleCheckRules} disabled={checking || !activeRule}>
              {checking ? 'Checking...' : 'Check Rules'}
            </Button>

            {violations.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">
                  Found {violations.length} violations
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Trade ID</TableHead>
                      <TableHead>Rule</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Impact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {violations.map((v, i) => (
                      <TableRow key={i}>
                        <TableCell>{v.tradeId}</TableCell>
                        <TableCell>{v.rule}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${
                            v.severity === 'high' ? 'bg-red-100 text-red-800' :
                            v.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {v.severity}
                          </span>
                        </TableCell>
                        <TableCell>${v.impact.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

