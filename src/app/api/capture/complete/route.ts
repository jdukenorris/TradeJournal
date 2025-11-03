import { NextResponse } from 'next/server'
import { createClient as createServerSupabase } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const captureId: string = body?.captureId
  const images: Array<{ tf: string; object_key: string; cdn_url?: string; width?: number; height?: number; sha256?: string }> = body?.images || []
  if (!captureId || images.length === 0) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const { error: upErr } = await supabase.from('capture_images').insert(
    images.map(img => ({
      capture_id: captureId,
      tf: img.tf,
      object_key: img.object_key,
      cdn_url: img.cdn_url ?? null,
      width: img.width ?? null,
      height: img.height ?? null,
      sha256: img.sha256 ?? null,
    }))
  )
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

  await supabase.from('captures').update({ status: 'done' }).eq('id', captureId)
  await supabase.from('capture_events').insert({ capture_id: captureId, step: 'completed' })

  return NextResponse.json({ ok: true })
}


