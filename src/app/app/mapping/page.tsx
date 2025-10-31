'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useMappingStore } from '@/stores/mappingStore'
import { FieldMapping } from '@/types'
import { toast } from 'sonner'

// Mock notion columns from selected template
const getNotionColumns = (): string[] => {
  const stored = localStorage.getItem('selectedNotionDatabase')
  if (stored) {
    const db = JSON.parse(stored)
    return Object.keys(db.properties || {})
  }
  return ['Trade ID', 'Symbol', 'Side', 'Quantity', 'Entry Time', 'Entry Price', 'Exit Time', 'Exit Price', 'P&L']
}

export default function MappingPage() {
  const { currentMappings, setMappings, savePreset, presets, resetMappings } = useMappingStore()
  const [notionColumns, setNotionColumns] = useState<string[]>([])
  const [showUnmappedOnly, setShowUnmappedOnly] = useState(false)

  const autoMap = () => {
    const columns = getNotionColumns()
    const autoMapped = currentMappings.map(mapping => {
      // Simple string similarity matching
      const match = columns.find(col => 
        col.toLowerCase().includes(mapping.brokerField.toLowerCase()) ||
        mapping.brokerField.toLowerCase().includes(col.toLowerCase())
      )
      return {
        ...mapping,
        notionColumn: match || null,
        confidence: match ? 'high' as const : undefined
      }
    })
    setMappings(autoMapped)
  }

  useEffect(() => {
    setNotionColumns(getNotionColumns())
    // Auto-map based on similarity
    autoMap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleMappingChange = (brokerField: string, notionColumn: string | null) => {
    const updated = currentMappings.map(m =>
      m.brokerField === brokerField
        ? { ...m, notionColumn, confidence: notionColumn ? 'high' as const : undefined }
        : m
    )
    setMappings(updated)
  }

  const handleSavePreset = () => {
    const name = prompt('Preset name:')
    if (name) {
      savePreset(name)
      toast.success('Preset saved')
    }
  }

  const filteredMappings = showUnmappedOnly
    ? currentMappings.filter(m => !m.notionColumn)
    : currentMappings

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Field Mapping</h1>
          <p className="text-muted-foreground">Map broker fields to Notion columns</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowUnmappedOnly(!showUnmappedOnly)}>
            {showUnmappedOnly ? 'Show All' : 'Unmapped Only'}
          </Button>
          <Button variant="outline" onClick={autoMap}>Auto-Map</Button>
          <Button variant="outline" onClick={resetMappings}>Reset</Button>
          <Button onClick={handleSavePreset}>Save Preset</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Field Mappings</CardTitle>
          <CardDescription>Drag or select to map broker fields to Notion columns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredMappings.map((mapping) => (
              <div key={mapping.brokerField} className="flex items-center gap-4 border rounded-lg p-4">
                <div className="flex-1">
                  <div className="font-medium">{mapping.brokerField}</div>
                  {mapping.isOptional && <span className="text-xs text-muted-foreground">Optional</span>}
                </div>
                <div className="text-muted-foreground">→</div>
                <div className="flex-1">
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={mapping.notionColumn || ''}
                    onChange={(e) => handleMappingChange(mapping.brokerField, e.target.value || null)}
                  >
                    <option value="">Select column...</option>
                    {notionColumns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                  {mapping.confidence && (
                    <span className={`text-xs mt-1 inline-block px-2 py-1 rounded ${
                      mapping.confidence === 'high' ? 'bg-green-100 text-green-800' :
                      mapping.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {mapping.confidence}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

