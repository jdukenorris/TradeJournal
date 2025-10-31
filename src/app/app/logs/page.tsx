'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { dataStore } from '@/lib/mocks/dataStore'
import { SyncEvent } from '@/types'
import { format } from 'date-fns'

export default function LogsPage() {
  const [events, setEvents] = useState<SyncEvent[]>([])
  const [filter, setFilter] = useState<'all' | 'success' | 'error'>('all')

  const loadEvents = () => {
    const allEvents = dataStore.syncEvents.getAll()
    const filtered = filter === 'all'
      ? allEvents
      : allEvents.filter(e => e.result === filter)
    setEvents(filtered)
  }

  useEffect(() => {
    loadEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Logs</h1>
          <p className="text-muted-foreground">Sync events and system logs</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm ${
              filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('success')}
            className={`px-4 py-2 rounded-md text-sm ${
              filter === 'success' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}
          >
            Success
          </button>
          <button
            onClick={() => setFilter('error')}
            className={`px-4 py-2 rounded-md text-sm ${
              filter === 'error' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}
          >
            Errors
          </button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sync Events</CardTitle>
          <CardDescription>Recent sync and action events</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No events found
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="text-sm">
                      {format(new Date(event.timestamp), 'MMM d, yyyy HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{event.source}</span>
                    </TableCell>
                    <TableCell>{event.action}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        event.result === 'success'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {event.result}
                      </span>
                    </TableCell>
                    <TableCell>{event.message}</TableCell>
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

