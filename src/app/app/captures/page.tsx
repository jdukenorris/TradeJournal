import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function CapturesListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div className="p-6">Please sign in</div>
  const { data: captures } = await supabase
    .from('captures')
    .select('id, symbol, requested_at, mode_used, status')
    .order('requested_at', { ascending: false })
    .limit(50)

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Captures</h1>
      <ul className="space-y-2">
        {(captures ?? []).map(c => (
          <li key={c.id} className="border rounded p-3">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">{c.symbol}</div>
                <div className="text-xs text-gray-500">{new Date(c.requested_at as any).toLocaleString()} · Mode {c.mode_used} · {c.status}</div>
              </div>
              <Link className="text-blue-600 underline" href={`/app/captures/${c.id}`}>Open</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}


