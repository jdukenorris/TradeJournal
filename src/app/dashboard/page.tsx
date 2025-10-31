import { requireAuth } from '@/lib/auth'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart3, 
  BookOpen, 
  PlusCircle, 
  Link as LinkIcon, 
  Settings, 
  FileText, 
  Calendar,
  Activity,
  ArrowRight
} from 'lucide-react'

export default async function DashboardPage() {
  const user = await requireAuth()

  const features = [
    {
      title: 'Overview',
      description: 'View trade statistics and sync status',
      href: '/app/overview',
      icon: BarChart3,
      color: 'text-blue-600',
    },
    {
      title: 'Journal',
      description: 'Voice-first trading journal entries',
      href: '/app/journal',
      icon: BookOpen,
      color: 'text-green-600',
    },
    {
      title: 'Manual Trade',
      description: 'Manually add trade entries',
      href: '/app/manual-trade',
      icon: PlusCircle,
      color: 'text-purple-600',
    },
    {
      title: 'Connections',
      description: 'Manage broker and Notion connections',
      href: '/app/connections',
      icon: LinkIcon,
      color: 'text-orange-600',
    },
    {
      title: 'Field Mapping',
      description: 'Map broker fields to Notion columns',
      href: '/app/mapping',
      icon: Settings,
      color: 'text-red-600',
    },
    {
      title: 'Trading Rules',
      description: 'Configure and manage trading rules',
      href: '/app/rules',
      icon: FileText,
      color: 'text-indigo-600',
    },
    {
      title: 'Weekly Review',
      description: 'AI-powered weekly trade summaries',
      href: '/app/weekly-review',
      icon: Calendar,
      color: 'text-pink-600',
    },
    {
      title: 'Notion Template',
      description: 'Set up your Notion database template',
      href: '/app/notion-template',
      icon: FileText,
      color: 'text-teal-600',
    },
    {
      title: 'Sync Logs',
      description: 'View sync activity and errors',
      href: '/app/logs',
      icon: Activity,
      color: 'text-gray-600',
    },
  ]

  return (
    <div className="flex flex-col p-8">
      <div className="max-w-7xl w-full mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.email}!</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Quick Access</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/app/overview" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
                Overview
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Journal Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/app/journal" className="text-2xl font-bold text-green-600 hover:text-green-700">
                Journal
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/app/connections" className="text-2xl font-bold text-orange-600 hover:text-orange-700">
                Connect
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/settings" className="text-2xl font-bold text-gray-600 hover:text-gray-700">
                Settings
              </Link>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Features</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Link key={feature.href} href={feature.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Icon className={`h-8 w-8 ${feature.color}`} />
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                      </div>
                      <CardTitle className="mt-2">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Set up your trading journal in a few simple steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>
                <Link href="/app/connections" className="text-blue-600 hover:underline">
                  Connect your broker and Notion account
                </Link>
              </li>
              <li>
                <Link href="/app/mapping" className="text-blue-600 hover:underline">
                  Map your broker fields to Notion columns
                </Link>
              </li>
              <li>
                <Link href="/app/notion-template" className="text-blue-600 hover:underline">
                  Set up your Notion database template
                </Link>
              </li>
              <li>
                <Link href="/app/overview" className="text-blue-600 hover:underline">
                  Start syncing trades and creating journal entries
                </Link>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

