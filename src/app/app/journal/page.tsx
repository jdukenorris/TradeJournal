'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { dataStore } from '@/lib/mocks/dataStore'
import { JournalEntry } from '@/types'
import { toast } from 'sonner'
import { aiClient } from '@/lib/mocks/aiClient'
import { notionClient } from '@/lib/mocks/notionClient'
import { Mic } from 'lucide-react'

const journalSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  tradeId: z.string().optional(),
  mood: z.string().optional(),
  confidence: z.number().min(1).max(5),
})

type JournalFormData = z.infer<typeof journalSchema>

export default function JournalPage() {
  const [activeTab, setActiveTab] = useState<'pre-market' | 'live-trade' | 'post-trade'>('pre-market')
  const [isRecording, setIsRecording] = useState(false)
  const [saveToNotion, setSaveToNotion] = useState(true)
  const { register, handleSubmit, setValue, watch, reset } = useForm<JournalFormData>({
    resolver: zodResolver(journalSchema),
    defaultValues: { confidence: 3 },
  })

  const trades = dataStore.trades.getRecent(10)

  const handleVoiceTranscribe = async () => {
    setIsRecording(true)
    try {
      // Mock audio blob
      const mockBlob = new Blob(['mock audio'], { type: 'audio/mp3' })
      const result = await aiClient.transcribeSpeech(mockBlob)
      setValue('content', result.cleanedText)
      toast.success('Transcription completed')
    } catch (error) {
      toast.error('Transcription failed')
    } finally {
      setIsRecording(false)
    }
  }

  const onSubmit = async (data: JournalFormData) => {
    try {
      const entry: JournalEntry = {
        id: `j-${Date.now()}`,
        type: activeTab,
        content: data.content,
        tradeId: data.tradeId,
        mood: data.mood,
        confidence: data.confidence,
        createdAt: new Date(),
      }

      dataStore.journals.add(entry)

      if (saveToNotion) {
        const result = await notionClient.pushJournal(entry)
        toast.success(`Journal saved to Notion: ${result.title}`)
      } else {
        toast.success('Journal entry saved')
      }

      reset()
    } catch (error) {
      toast.error('Failed to save journal')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Journal</h1>
        <p className="text-muted-foreground">Record your trading thoughts and reflections</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Journal Entry</CardTitle>
          <CardDescription>Select type and compose your journal entry</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pre-market">Pre-Market</TabsTrigger>
              <TabsTrigger value="live-trade">Live Trade</TabsTrigger>
              <TabsTrigger value="post-trade">Post-Trade</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content">Content</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleVoiceTranscribe}
                    disabled={isRecording}
                    aria-label="Record voice"
                  >
                    <Mic className={`h-4 w-4 mr-2 ${isRecording ? 'animate-pulse' : ''}`} />
                    {isRecording ? 'Recording...' : 'Record'}
                  </Button>
                </div>
                <textarea
                  id="content"
                  {...register('content')}
                  className="w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2"
                  placeholder="Write your journal entry or use voice transcription..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tradeId">Link to Trade (optional)</Label>
                <select
                  id="tradeId"
                  {...register('tradeId')}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="">None</option>
                  {trades.map(trade => (
                    <option key={trade.id} value={trade.id}>
                      {trade.tradeId} - {trade.symbol} {trade.side}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mood">Mood/Emotion (optional)</Label>
                <select
                  id="mood"
                  {...register('mood')}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="">None</option>
                  <option value="confident">Confident</option>
                  <option value="cautious">Cautious</option>
                  <option value="frustrated">Frustrated</option>
                  <option value="excited">Excited</option>
                  <option value="reflective">Reflective</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Confidence Level: {watch('confidence')}</Label>
                <Slider
                  min={1}
                  max={5}
                  step={1}
                  value={[watch('confidence')]}
                  onValueChange={([value]) => setValue('confidence', value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="saveToNotion"
                  checked={saveToNotion}
                  onChange={(e) => setSaveToNotion(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="saveToNotion">Save to Notion</Label>
              </div>

              <Button onClick={handleSubmit(onSubmit)} className="w-full">
                Save Journal Entry
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

