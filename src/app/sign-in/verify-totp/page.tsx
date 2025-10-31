'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function VerifyTOTPPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/sign-in')
        return
      }

      // Check if MFA challenge is needed
      const { data: factors } = await supabase.auth.mfa.listFactors()
      const hasTOTP = factors?.totp && factors.totp.length > 0

      if (!hasTOTP) {
        router.push('/dashboard')
        return
      }

      // Create a challenge for the TOTP factor
      const totpFactor = factors.totp[0]
      if (totpFactor) {
        const { error: challengeError } = await supabase.auth.mfa.challenge({
          factorId: totpFactor.id,
        })

        if (challengeError) {
          setError(challengeError.message)
        }
      }
    }

    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: factors } = await supabase.auth.mfa.listFactors()
      const totpFactor = factors?.totp?.[0]

      if (!totpFactor) {
        setError('No TOTP factor found')
        setLoading(false)
        return
      }

      const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
        factorId: totpFactor.id,
        code,
      })

      if (verifyError) {
        setError(verifyError.message)
        setLoading(false)
        return
      }

      router.push('/dashboard')
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6">Verify TOTP Code</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="code" className="block text-sm font-medium mb-2">
              Authentication Code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              maxLength={6}
              placeholder="000000"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
            />
            <p className="mt-2 text-sm text-gray-600">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>
    </div>
  )
}

