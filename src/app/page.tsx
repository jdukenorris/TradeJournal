'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/app/overview')
    }
  }, [isAuthenticated, router])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Notion Trade Journal Bridge
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Voice-first trading journal that syncs to Notion and provides AI reviews
        </p>
        
        <div className="text-center space-x-4">
          <Link
            href="/login"
            className="inline-block bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  )
}
