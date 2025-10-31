'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { AppSidebar, AppTopbar } from '@/components/app-layout'
import { Toaster } from '@/components/ui/toaster'
import { seedDemoData } from '@/lib/mocks/dataStore'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    // Seed demo data in mock mode
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      seedDemoData()
    }
  }, [])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  )
}

