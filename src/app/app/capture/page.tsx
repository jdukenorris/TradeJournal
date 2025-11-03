'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type CreateResponse = {
  captureId: string
  mode: 'A' | 'B'
}

export default function CapturePage() {
  const [symbol, setSymbol] = useState('ES')
  const [zoom, setZoom] = useState<'Tight' | 'Medium' | 'Wide'>('Medium')
  const [status, setStatus] = useState<string>('Idle')
  const [result, setResult] = useState<CreateResponse | null>(null)

  async function onCapture() {
    setStatus('Sending...')
    setResult(null)
    const res = await fetch('/api/capture/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, tfs: ['1h', '5m'], zoomPreset: zoom })
    })
    if (!res.ok) {
      setStatus('Error: ' + (await res.text()))
      return
    }
    const data = await res.json()
    setResult({ captureId: data.captureId, mode: data.mode })
    setStatus(data.mode === 'A' ? 'Queued on device' : 'Queued on server (Mode B)')
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Capture TradingView Screenshots</h1>
      <div className="space-y-4">
        <div>
          <Label htmlFor="symbol">Symbol</Label>
          <Input id="symbol" value={symbol} onChange={e => setSymbol(e.target.value)} />
        </div>
        <div>
          <Label>Zoom preset</Label>
          <div className="flex gap-2 mt-2">
            {(['Tight','Medium','Wide'] as const).map(z => (
              <Button key={z} variant={z===zoom?'default':'outline'} onClick={() => setZoom(z)}>
                {z}
              </Button>
            ))}
          </div>
        </div>
        <Button onClick={onCapture}>Capture 1H + 5m</Button>
      </div>
      <div className="text-sm text-gray-600">Status: {status}</div>
      {result && (
        <div className="rounded border p-3 text-sm">
          Capture {result.captureId} queued (Mode {result.mode}). Check the Captures page to view images after completion.
        </div>
      )}
    </div>
  )
}


