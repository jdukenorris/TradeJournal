'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useConnectionStore } from '@/stores/connectionStore'
import { toast } from 'sonner'
import { brokerClient } from '@/lib/mocks/brokerClient'
import { notionClient } from '@/lib/mocks/notionClient'

export default function ConnectionsPage() {
  const [step, setStep] = useState(1)
  const [brokerData, setBrokerData] = useState({ broker: 'tradovate', apiKey: '', apiSecret: '' })
  const [notionToken, setNotionToken] = useState('')
  const [testing, setTesting] = useState(false)
  const { broker, notion, setBroker, setNotion } = useConnectionStore()

  const handleBrokerConnect = () => {
    setBroker({
      id: 'broker-1',
      broker: brokerData.broker as 'tradovate',
      apiKey: brokerData.apiKey,
      apiSecret: brokerData.apiSecret,
      isConnected: true,
      createdAt: new Date(),
    })
    setStep(2)
    toast.success('Broker connected')
  }

  const handleTestNotion = async () => {
    setTesting(true)
    try {
      const connected = await notionClient.testConnection(notionToken)
      if (connected) {
        setNotion({
          id: 'notion-1',
          token: notionToken,
          isConnected: true,
          createdAt: new Date(),
        })
        toast.success('Notion connection successful')
      } else {
        toast.error('Connection failed')
      }
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Connections</h1>
        <p className="text-muted-foreground">Connect your broker and Notion workspace</p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className={`h-1 flex-1 rounded ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
        <div className={`h-1 flex-1 rounded ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Connect Broker</CardTitle>
            <CardDescription>Select your broker and enter API credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="border rounded-lg p-4 cursor-pointer hover:bg-accent" onClick={() => setBrokerData({ ...brokerData, broker: 'tradovate' })}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Tradovate</h3>
                    <p className="text-sm text-muted-foreground">Connect your Tradovate account</p>
                  </div>
                  {brokerData.broker === 'tradovate' && <div className="w-4 h-4 rounded-full bg-primary" />}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                placeholder="Enter your API key"
                value={brokerData.apiKey}
                onChange={(e) => setBrokerData({ ...brokerData, apiKey: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiSecret">API Secret</Label>
              <Input
                id="apiSecret"
                type="password"
                placeholder="Enter your API secret"
                value={brokerData.apiSecret}
                onChange={(e) => setBrokerData({ ...brokerData, apiSecret: e.target.value })}
              />
            </div>
            <Button onClick={handleBrokerConnect} className="w-full">Connect Broker</Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Connect Notion</CardTitle>
            <CardDescription>Enter your Notion integration token</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notionToken">Notion Token</Label>
              <Input
                id="notionToken"
                placeholder="secret_..."
                value={notionToken}
                onChange={(e) => setNotionToken(e.target.value)}
              />
            </div>
            <Button onClick={handleTestNotion} disabled={testing} className="w-full">
              {testing ? 'Testing...' : 'Test Connection'}
            </Button>
            {notion && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                <p className="text-sm text-green-800">✓ Notion connected successfully</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

