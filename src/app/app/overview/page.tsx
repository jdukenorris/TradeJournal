'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { dataStore } from '@/lib/mocks/dataStore'
import { Trade, SyncEvent } from '@/types'
import { format } from 'date-fns'
import { RefreshCw, BookOpen, ArrowLeftRight } from 'lucide-react'
import { toast } from 'sonner'
import { brokerClient } from '@/lib/mocks/brokerClient'

export default function OverviewPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [syncing, setSyncing] = useState(false)
  const [stats, setStats] = useState({
    tradesToday: 0,
    lastSync: null as Date | null,
    nextSync: null as Date | null,
    unmappedFields: 3,
    ruleBreaks: 2,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const recentTrades = dataStore.trades.getRecent(10)
    setTrades(recentTrades)
    
    const events = dataStore.syncEvents.getAll()
    const lastSync = events[0]?.timestamp || null
    setStats(prev => ({
      ...prev,
      tradesToday: recentTrades.filter(t => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return new Date(t.syncedAt || t.entryTime) >= today
      }).length,
      lastSync: lastSync ? new Date(lastSync) : null,
      nextSync: lastSync ? new Date(new Date(lastSync).getTime() + 3600000) : null,
    }))
  }

  const handleSyncNow = async () => {
    setSyncing(true)
    try {
      await brokerClient.syncTrades()
      toast.success('Sync completed successfully')
      loadData()
    } catch (error) {
      toast.error('Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Overview</h1>
        <p className="text-muted-foreground">Dashboard and trade summary</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trades Synced Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tradesToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {stats.lastSync ? format(stats.lastSync, 'HH:mm') : 'Never'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Scheduled Sync</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {stats.nextSync ? format(stats.nextSync, 'HH:mm') : 'Not scheduled'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unmapped Fields</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unmappedFields}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rule Breaks This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ruleBreaks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleSyncNow} disabled={syncing} data-testid="sync-now-button">
          <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          Sync Now
        </Button>
        <Button variant="outline" onClick={() => window.location.href = '/app/journal'}>
          <BookOpen className="h-4 w-4 mr-2" />
          Open Journal
        </Button>
        <Button variant="outline" onClick={() => window.location.href = '/app/mapping'}>
          <ArrowLeftRight className="h-4 w-4 mr-2" />
          Re-Map
        </Button>
      </div>

      {/* Recent Trades Table */}
      <Card>
        <CardHeader>
          <CardTitle>Last 10 Synced Trades</CardTitle>
          <CardDescription>Recently synced trades from your broker</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trade ID</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Side</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Entry</TableHead>
                <TableHead>Exit</TableHead>
                <TableHead>P&L</TableHead>
                <TableHead>Synced</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No trades synced yet
                  </TableCell>
                </TableRow>
              ) : (
                trades.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell className="font-medium">{trade.tradeId}</TableCell>
                    <TableCell>{trade.symbol}</TableCell>
                    <TableCell>{trade.side}</TableCell>
                    <TableCell>{trade.qty}</TableCell>
                    <TableCell>
                      {format(trade.entryTime, 'MM/dd HH:mm')} @ ${trade.entryPrice}
                    </TableCell>
                    <TableCell>
                      {trade.exitTime ? `${format(trade.exitTime, 'MM/dd HH:mm')} @ $${trade.exitPrice}` : '-'}
                    </TableCell>
                    <TableCell className={trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                      ${trade.pnl.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {trade.syncedAt ? format(trade.syncedAt, 'MM/dd HH:mm') : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

