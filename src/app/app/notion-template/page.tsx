'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { notionClient } from '@/lib/mocks/notionClient'
import { NotionDatabase } from '@/types'
import { useMappingStore } from '@/stores/mappingStore'

export default function NotionTemplatePage() {
  const [databases, setDatabases] = useState<NotionDatabase[]>([])
  const [loading, setLoading] = useState(true)
  const { setSelectedDatabase } = useMappingStore()

  useEffect(() => {
    loadDatabases()
  }, [])

  const loadDatabases = async () => {
    setLoading(true)
    try {
      const dbs = await notionClient.listDatabases()
      setDatabases(dbs)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectDatabase = (db: NotionDatabase) => {
    setSelectedDatabase(db.id)
    // Store in localStorage for persistence
    localStorage.setItem('selectedNotionDatabase', JSON.stringify(db))
  }

  const handleStarterTemplate = () => {
    const starterDb: NotionDatabase = {
      id: 'starter-template',
      name: 'Starter Template',
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
    }
    handleSelectDatabase(starterDb)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notion Template</h1>
        <p className="text-muted-foreground">Select or create a Notion database template</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Starter Template</CardTitle>
          <CardDescription>Pre-configured template with all standard fields</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleStarterTemplate}>Use Starter Template</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Databases</CardTitle>
          <CardDescription>Select from your existing Notion databases</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {databases.map((db) => (
                <div
                  key={db.id}
                  className="border rounded-lg p-4 hover:bg-accent cursor-pointer"
                  onClick={() => handleSelectDatabase(db)}
                >
                  <h3 className="font-medium">{db.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {Object.keys(db.properties).length} properties
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

