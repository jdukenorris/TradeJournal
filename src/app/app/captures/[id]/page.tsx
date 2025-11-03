import { createClient } from '@/lib/supabase/server'

type Params = { params: { id: string } }

export default async function CaptureDetailPage({ params }: Params) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div className="p-6">Please sign in</div>

  const { data: capture } = await supabase
    .from('captures')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()

  const { data: images } = await supabase
    .from('capture_images')
    .select('*')
    .eq('capture_id', params.id)
    .order('tf', { ascending: false })

  return (
    <div className="p-6 space-y-4">
      {!capture ? (
        <div>Not found</div>
      ) : (
        <div>
          <h1 className="text-xl font-semibold">{capture.symbol} — Capture</h1>
          <div className="text-sm text-gray-500">{new Date(capture.requested_at).toLocaleString()} · Mode {capture.mode_used} · {capture.status}</div>
          <div className="mt-2 text-xs rounded bg-gray-50 border p-2 text-gray-600">
            {capture.mode_used === 'A' ? (
              <>Captured locally from your logged‑in TradingView session. Private studies are visible.</>
            ) : (
              <>Captured on server from a view‑only layout. Private/invite‑only studies are not visible.</>
            )}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4">
        {(images ?? []).map(img => (
          <div key={img.id} className="border rounded p-3">
            <div className="text-sm mb-2">Timeframe: {img.tf}</div>
            {/* Images are private; link shows object path. UI can mint signed URL-on-click later. */}
            <div className="text-xs text-gray-600">Object: {img.object_key}</div>
          </div>
        ))}
      </div>
    </div>
  )
}


