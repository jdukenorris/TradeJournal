'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function MFAPage() {
  const router = useRouter()
  const [enrolled, setEnrolled] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    checkMFAStatus()
  }, [])

  const checkMFAStatus = async () => {
    const supabase = createClient()
    const { data: factors } = await supabase.auth.mfa.listFactors()
    const hasTOTP = !!(factors?.totp && factors.totp.length > 0)
    setEnrolled(hasTOTP)
  }

  const handleEnroll = async () => {
    setError(null)
    setEnrolling(true)

    try {
      const supabase = createClient()
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Google Authenticator',
      })

      if (enrollError) {
        setError(enrollError.message)
        setEnrolling(false)
        return
      }

      if (data) {
        setQrCode(data.totp.qr_code)
        setSecret(data.totp.secret)
        
        // Create a challenge for verification
        const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
          factorId: data.id,
        })
        
        if (challengeError) {
          setError(challengeError.message)
          setEnrolling(false)
          return
        }
        
        if (challengeData) {
          setChallengeId(challengeData.id)
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setEnrolling(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!secret || !challengeId) {
      setError('Missing challenge. Please try enrolling again.')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { data: factors } = await supabase.auth.mfa.listFactors()
      const totpFactor = factors?.totp?.[0]

      if (!totpFactor) {
        setError('No TOTP factor found. Please try enrolling again.')
        setLoading(false)
        return
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId,
        code: verificationCode,
      })

      if (verifyError) {
        setError(verifyError.message)
        setLoading(false)
        return
      }

      // MFA enrolled successfully
      setEnrolled(true)
      setQrCode(null)
      setSecret(null)
      setChallengeId(null)
      setVerificationCode('')
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  const handleUnenroll = async () => {
    if (!confirm('Are you sure you want to disable MFA? This will reduce your account security.')) {
      return
    }

    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: factors } = await supabase.auth.mfa.listFactors()
      const totpFactor = factors?.totp?.[0]

      if (totpFactor) {
        const { error: unenrollError } = await supabase.auth.mfa.unenroll({
          factorId: totpFactor.id,
        })

        if (unenrollError) {
          setError(unenrollError.message)
          setLoading(false)
          return
        }

        setEnrolled(false)
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col p-8">
      <div className="max-w-2xl w-full mx-auto">
        <h1 className="text-3xl font-bold mb-6">Two-Factor Authentication</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {enrolled ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
              MFA is enabled on your account
            </div>
            <button
              onClick={handleUnenroll}
              disabled={loading}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Disabling...' : 'Disable MFA'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {!qrCode ? (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enrolling ? 'Setting up...' : 'Enable MFA'}
              </button>
            ) : (
              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Scan this QR code with your authenticator app (e.g., Google Authenticator):
                  </p>
                  {qrCode && (
                    <div className="flex justify-center mb-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrCode} alt="QR Code" className="border border-gray-300 rounded" />
                    </div>
                  )}
                  {secret && (
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded mb-4">
                      <p className="text-xs text-gray-600 mb-2">Or enter this secret manually:</p>
                      <code className="text-sm font-mono break-all">{secret}</code>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="verificationCode" className="block text-sm font-medium mb-2">
                    Enter verification code
                  </label>
                  <input
                    id="verificationCode"
                    type="text"
                    value={verificationCode}
                    onChange={(e) =>
                      setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    required
                    maxLength={6}
                    placeholder="000000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || verificationCode.length !== 6}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify and Enable'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

