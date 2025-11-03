#!/usr/bin/env node

// Create private Supabase Storage bucket `captures`

const { createClient } = require('@supabase/supabase-js')

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env')
    process.exit(1)
  }
  const supabase = createClient(url, serviceKey)

  const bucket = 'captures'
  const { data: existing, error: listErr } = await supabase.storage.listBuckets()
  if (listErr) {
    console.error('List buckets failed:', listErr.message)
    process.exit(1)
  }
  const exists = existing?.some(b => b.name === bucket)
  if (exists) {
    console.log('Bucket already exists:', bucket)
    return
  }

  const { data, error } = await supabase.storage.createBucket(bucket, {
    public: false,
    fileSizeLimit: '20MB'
  })
  if (error) {
    console.error('Create bucket failed:', error.message)
    process.exit(1)
  }
  console.log('Created private bucket:', data?.name || bucket)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})


