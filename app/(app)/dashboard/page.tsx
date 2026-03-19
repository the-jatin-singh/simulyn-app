import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ClientDashboard } from './ClientDashboard'
import { headers } from 'next/headers'
import { logout } from '@/app/(app)/login/actions'
import { PlusCircle, Webhook, LogOut } from 'lucide-react'
import { DashboardHeader } from '@/components/DashboardHeader'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = !!profile && ['admin', 'owner'].includes(profile.role)

  const { data: endpoints } = await supabase
    .from('endpoints')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
  const origin = `${protocol}://${host}`

  return (
    <div className="min-h-screen bg-[#F9F9FA]">
      <DashboardHeader userTitle={user.user_metadata?.namespace || user.email} isAdmin={isAdmin} adminRole={isAdmin ? (profile?.role as 'admin' | 'owner') : undefined} />

      <main className="max-w-6xl mx-auto px-6 py-10 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">API Endpoints</h1>
            <p className="text-sm font-medium text-zinc-500 mt-1">Manage and access your dynamic mock APIs.</p>
          </div>
          <Link href="/endpoints/create" className="inline-flex items-center gap-1.5 bg-zinc-900 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-all shadow-sm shadow-zinc-900/10 active:scale-95">
            <PlusCircle className="w-4 h-4" /> New Endpoint
          </Link>
        </div>

        {endpoints && endpoints.length > 0 ? (
          <ClientDashboard endpoints={endpoints} origin={origin} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-300 rounded-lg bg-white/50">
            <div className="w-12 h-12 bg-white border border-zinc-200 rounded-full flex items-center justify-center mb-4 shadow-sm">
               <Webhook className="w-5 h-5 text-zinc-400" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-1">No endpoints created</h3>
            <p className="text-sm text-zinc-500 mb-6 font-medium max-w-sm text-center">Get started by defining a JSON schema or template to receive realistic dummy data.</p>
            <Link href="/endpoints/create" className="inline-flex items-center gap-1.5 bg-white border border-zinc-200 text-zinc-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-50 hover:text-zinc-900 transition-colors shadow-sm">
              <PlusCircle className="w-4 h-4" /> New Endpoint
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
