'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuthStore()

  const handleLogin = () => {
    login('john@example.com')
    router.push('/app/overview')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Trade Journal Bridge</h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to access your dashboard
          </p>
        </div>
        <div className="space-y-4">
          <div className="rounded-md border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground mb-2">
              Demo Mode: Using mock authentication
            </p>
            <p className="text-xs text-muted-foreground">
              Email: john@example.com
            </p>
          </div>
          <Button 
            onClick={handleLogin}
            className="w-full"
            data-testid="login-button"
          >
            Login
          </Button>
        </div>
      </div>
    </div>
  )
}

