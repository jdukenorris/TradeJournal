import { NextResponse } from 'next/server'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const CAPTURE_BUCKET = 'captures'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const symbol: string = body?.symbol
    const tfs: string[] = body?.tfs ?? ['1h', '5m']
    const zoomPreset: string | undefined = body?.zoomPreset
    const layoutId: string | undefined = body?.layoutId
    if (!symbol) {
      return NextResponse.json({ error: 'symbol required' }, { status: 400 })
    }

    // find device online
    const { data: device } = await supabase
      .from('devices')
      .select('*')
      .eq('user_id', user.id)
      .eq('online', true)
      .gt('last_seen_at', new Date(Date.now() - 60_000).toISOString())
      .limit(1)
      .maybeSingle()

    // create capture row
    const { data: captureRow, error: insertErr } = await supabase
      .from('captures')
      .insert({
        user_id: user.id,
        symbol,
        requested_tfs: tfs,
        zoom_profile: zoomPreset ? { preset: zoomPreset } : null,
        status: 'queued',
        mode_used: device ? 'A' : 'B',
        device_id: device?.id ?? null
      })
      .select('*')
      .single()

    if (insertErr || !captureRow) {
      return NextResponse.json({ error: insertErr?.message ?? 'insert failed' }, { status: 500 })
    }

    const admin = createAdminClient()

    // prepare signed upload URLs
    const uploads: Record<string, { path: string; signedUrl: string }> = {}
    for (const tf of tfs) {
      const objectPath = `user/${user.id}/capture/${captureRow.id}/${tf}.png`
      const { data, error } = await admin.storage
        .from(CAPTURE_BUCKET)
        .createSignedUploadUrl(objectPath)
      if (error || !data) {
        return NextResponse.json({ error: error?.message ?? 'signed url failed' }, { status: 500 })
      }
      uploads[tf] = { path: objectPath, signedUrl: data.signedUrl }
    }

    // optional layout lookup
    let layout: any = null
    if (layoutId) {
      const { data } = await supabase
        .from('layouts')
        .select('*')
        .eq('id', layoutId)
        .maybeSingle()
      layout = data
    }

    // command object for device (Mode A) or for Mode B worker
    const command = {
      captureId: captureRow.id,
      symbol,
      tfs,
      zoomPreset: zoomPreset ?? null,
      layoutUrl: layout?.modeA_url ?? null,
      uploadTargets: uploads
    }

    await supabase.from('capture_events').insert({
      capture_id: captureRow.id,
      step: 'created',
      detail: { mode: device ? 'A' : 'B' }
    })

    // If Mode B and a render service is configured, synchronously render and upload
    if (!device && process.env.PLAYWRIGHT_SERVICE_URL) {
      try {
        const resp = await fetch(`${process.env.PLAYWRIGHT_SERVICE_URL}/render`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.PLAYWRIGHT_SERVICE_TOKEN || ''}`
          },
          body: JSON.stringify({ layoutUrl: layout?.modeB_view_only_url, symbol, tfs, zoomProfile: command.zoomPreset })
        })
        if (resp.ok) {
          const { images } = await resp.json()
          const adminUpload = createAdminClient()
          for (const tf of tfs) {
            const objectPath = `user/${user.id}/capture/${captureRow.id}/${tf}.png`
            const buf = Buffer.from((images[tf] || '').split(',')[1] || '', 'base64')
            await adminUpload.storage.from(CAPTURE_BUCKET).upload(objectPath, buf, { contentType: 'image/png', upsert: true })
            await supabase.from('capture_images').insert({ capture_id: captureRow.id, tf, object_key: objectPath })
          }
          await supabase.from('captures').update({ status: 'done' }).eq('id', captureRow.id)
          await supabase.from('capture_events').insert({ capture_id: captureRow.id, step: 'completed', detail: { mode: 'B' } })
        }
      } catch {}
    }

    return NextResponse.json({
      captureId: captureRow.id,
      mode: device ? 'A' : 'B',
      command,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'unknown error' }, { status: 500 })
  }
}


