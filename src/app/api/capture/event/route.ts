import { NextResponse } from 'next/server'
import { createClient as createServerSupabase } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { captureId, step, detail } = body || {}
  if (!captureId || !step) return NextResponse.json({ error: 'captureId and step required' }, { status: 400 })

  const { error } = await supabase.from('capture_events').insert({ capture_id: captureId, step, detail: detail ?? null })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}


