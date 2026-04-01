import { TooltipProvider } from '@/components/ui/tooltip'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-[#0a0a0a]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  )
}
