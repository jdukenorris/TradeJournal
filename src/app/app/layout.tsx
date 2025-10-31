import { AppLayout } from '@/components/app-layout-wrapper'

export default function AppLayoutPage({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>
}

