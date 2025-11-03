import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SignOutButton } from '@/components/SignOutButton'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signOut: vi.fn(),
    },
  }),
}))

describe('SignOutButton', () => {
  it('renders sign out button', () => {
    render(<SignOutButton />)
    expect(screen.getByText('Sign Out')).toBeInTheDocument()
  })
})

