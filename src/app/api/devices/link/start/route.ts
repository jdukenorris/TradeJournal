import { NextResponse } from 'next/server'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { signPayload } from '@/lib/crypto'

export async function POST() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const challenge = signPayload({ purpose: 'device_link', user_id: user.id, nonce: cryptoRandom() }, 10 * 60)
  return NextResponse.json({ challenge })
}

function cryptoRandom() {
  return Math.random().toString(36).slice(2)
}


