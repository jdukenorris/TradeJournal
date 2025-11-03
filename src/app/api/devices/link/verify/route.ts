import { NextResponse } from 'next/server'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { verifyAndDecode, signPayload } from '@/lib/crypto'

export async function POST(req: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const challenge: string | undefined = body?.challenge
  const name: string = body?.name ?? 'Browser Extension'
  const type: 'extension' | 'electron' = body?.type ?? 'extension'
  if (!challenge) return NextResponse.json({ error: 'challenge required' }, { status: 400 })

  const decoded = verifyAndDecode(challenge)
  if (!decoded || decoded.purpose !== 'device_link' || decoded.user_id !== user.id) {
    return NextResponse.json({ error: 'invalid challenge' }, { status: 400 })
  }

  const { data: device, error } = await supabase
    .from('devices')
    .insert({ user_id: user.id, type, name, online: true, last_seen_at: new Date().toISOString() })
    .select('*')
    .single()
  if (error || !device) {
    return NextResponse.json({ error: error?.message ?? 'device create failed' }, { status: 500 })
  }

  const deviceToken = signPayload({ purpose: 'device_token', device_id: device.id, user_id: user.id }, 30 * 24 * 60 * 60)

  return NextResponse.json({ deviceId: device.id, deviceToken })
}


