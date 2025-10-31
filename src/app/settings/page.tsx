import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="flex flex-col p-8">
      <div className="max-w-5xl w-full">
        <h1 className="text-4xl font-bold mb-8">Settings</h1>
        <div className="space-y-4">
          <Link
            href="/settings/mfa"
            className="block bg-white border border-gray-200 rounded-lg p-6 hover:bg-gray-50"
          >
            <h2 className="text-xl font-semibold mb-2">Two-Factor Authentication</h2>
            <p className="text-gray-600">Enable or disable MFA for your account</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

