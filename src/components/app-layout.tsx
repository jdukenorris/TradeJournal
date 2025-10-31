'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { 
  LayoutDashboard, 
  Link2, 
  FileText, 
  ArrowLeftRight, 
  BookOpen, 
  PlusCircle, 
  Calendar, 
  Shield, 
  FileSearch,
  LogOut,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/app/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/app/connections', label: 'Connections', icon: Link2 },
  { href: '/app/notion-template', label: 'Notion Template', icon: FileText },
  { href: '/app/mapping', label: 'Mapping', icon: ArrowLeftRight },
  { href: '/app/journal', label: 'Journal', icon: BookOpen },
  { href: '/app/manual-trade', label: 'Manual Trade', icon: PlusCircle },
  { href: '/app/weekly-review', label: 'Weekly Review', icon: Calendar },
  { href: '/app/rules', label: 'Rules', icon: Shield },
  { href: '/app/logs', label: 'Logs', icon: FileSearch },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-lg font-semibold">Trade Journal</h1>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export function AppTopbar() {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-medium">Dashboard</h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{user?.email}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  )
}

