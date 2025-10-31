'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { dataStore } from '@/lib/mocks/dataStore'
import { Trade } from '@/types'
import { toast } from 'sonner'
import { notionClient } from '@/lib/mocks/notionClient'
import { useState } from 'react'

const tradeSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  side: z.enum(['BUY', 'SELL']),
  qty: z.number().min(1, 'Quantity must be at least 1'),
  entryTime: z.string(),
  entryPrice: z.number().min(0.01),
  exitTime: z.string().optional(),
  exitPrice: z.number().optional(),
  fees: z.number().min(0),
  account: z.string(),
  strategyTags: z.string(),
  notes: z.string().optional(),
})

type TradeFormData = z.infer<typeof tradeSchema>

export default function ManualTradePage() {
  const [pushToNotion, setPushToNotion] = useState(true)
  const { register, handleSubmit, formState: { errors }, reset } = useForm<TradeFormData>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      side: 'BUY',
      account: 'Main',
      strategyTags: '',
      fees: 0,
    },
  })

  const onSubmit = async (data: TradeFormData) => {
    try {
      const entryTime = new Date(data.entryTime)
      const exitTime = data.exitTime ? new Date(data.exitTime) : null
      const exitPrice = data.exitPrice || null

      // Calculate P&L
      const pnl = exitTime && exitPrice
        ? (exitPrice - data.entryPrice) * data.qty * (data.side === 'BUY' ? 1 : -1) - data.fees
        : 0

      const trade: Trade = {
        id: `trade-${Date.now()}`,
        tradeId: `T-${Date.now().toString().slice(-6)}`,
        symbol: data.symbol,
        side: data.side,
        qty: data.qty,
        entryTime,
        entryPrice: data.entryPrice,
        exitTime,
        exitPrice,
        pnl,
        fees: data.fees,
        account: data.account,
        strategyTags: data.strategyTags.split(',').map(t => t.trim()).filter(Boolean),
        notes: data.notes,
        syncedAt: new Date(),
      }

      dataStore.trades.add(trade)

      if (pushToNotion) {
        const result = await notionClient.pushTrade(trade)
        toast.success(`Trade saved to Notion: ${result.title}`)
      } else {
        toast.success('Trade saved')
      }

      reset()
      // Redirect to overview
      setTimeout(() => window.location.href = '/app/overview', 1000)
    } catch (error) {
      toast.error('Failed to save trade')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manual Trade Entry</h1>
        <p className="text-muted-foreground">Add a trade manually</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trade Details</CardTitle>
          <CardDescription>Enter trade information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol *</Label>
                <Input id="symbol" {...register('symbol')} placeholder="AAPL" />
                {errors.symbol && <p className="text-sm text-red-500">{errors.symbol.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="side">Side *</Label>
                <select
                  id="side"
                  {...register('side')}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qty">Quantity *</Label>
                <Input
                  id="qty"
                  type="number"
                  {...register('qty', { valueAsNumber: true })}
                  placeholder="100"
                />
                {errors.qty && <p className="text-sm text-red-500">{errors.qty.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="entryPrice">Entry Price *</Label>
                <Input
                  id="entryPrice"
                  type="number"
                  step="0.01"
                  {...register('entryPrice', { valueAsNumber: true })}
                  placeholder="150.25"
                />
                {errors.entryPrice && <p className="text-sm text-red-500">{errors.entryPrice.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="entryTime">Entry Time *</Label>
                <Input
                  id="entryTime"
                  type="datetime-local"
                  {...register('entryTime')}
                />
                {errors.entryTime && <p className="text-sm text-red-500">{errors.entryTime.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="exitPrice">Exit Price</Label>
                <Input
                  id="exitPrice"
                  type="number"
                  step="0.01"
                  {...register('exitPrice', { valueAsNumber: true, setValueAs: v => v === '' ? undefined : Number(v) })}
                  placeholder="152.80"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exitTime">Exit Time</Label>
                <Input
                  id="exitTime"
                  type="datetime-local"
                  {...register('exitTime')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fees">Fees</Label>
                <Input
                  id="fees"
                  type="number"
                  step="0.01"
                  {...register('fees', { valueAsNumber: true })}
                  placeholder="1.50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account">Account</Label>
                <Input id="account" {...register('account')} placeholder="Main" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="strategyTags">Strategy Tags (comma-separated)</Label>
              <Input
                id="strategyTags"
                {...register('strategyTags')}
                placeholder="Momentum, Breakout"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                {...register('notes')}
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2"
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="pushToNotion"
                checked={pushToNotion}
                onChange={(e) => setPushToNotion(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="pushToNotion">Push to Notion</Label>
            </div>

            <Button type="submit" className="w-full">Save Trade</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

