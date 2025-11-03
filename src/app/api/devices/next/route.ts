import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAndDecode } from '@/lib/crypto'

const CAPTURE_BUCKET = 'captures'

export async function GET(req: Request) {
  const auth = req.headers.get('device-token') || ''
  const decoded = verifyAndDecode(auth)
  if (!decoded || decoded.purpose !== 'device_token') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const admin = createAdminClient()

  // find next capture queued for this device
  const { data: captures, error } = await admin
    .from('captures')
    .select('*')
    .eq('device_id', decoded.device_id)
    .eq('status', 'queued')
    .limit(1)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const capture = captures?.[0]
  if (!capture) return new NextResponse(null, { status: 204 })

  // generate signed upload URLs per timeframe
  const uploads: Record<string, { path: string; signedUrl: string }> = {}
  for (const tf of capture.requested_tfs as string[]) {
    const objectPath = `user/${capture.user_id}/capture/${capture.id}/${tf}.png`
    const { data, error } = await admin.storage
      .from(CAPTURE_BUCKET)
      .createSignedUploadUrl(objectPath)
    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? 'signed url failed' }, { status: 500 })
    }
    uploads[tf] = { path: objectPath, signedUrl: data.signedUrl }
  }

  return NextResponse.json({
    command: {
      captureId: capture.id,
      symbol: capture.symbol,
      tfs: capture.requested_tfs,
      zoomPreset: capture.zoom_profile?.preset ?? null,
      uploadTargets: uploads
    }
  })
}


