import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { PreviewClient } from './PreviewClient'
import { headers } from 'next/headers'
import { DashboardHeader } from '@/components/DashboardHeader'

export default async function EndpointPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: endpoint } = await supabase
    .from('endpoints')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!endpoint) notFound()

  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
  const fullUrl = `${protocol}://${host}/api/mock/${endpoint.namespace}/${endpoint.path}`

  return (
    <div className="min-h-screen bg-[#F9F9FA] flex flex-col">
      <DashboardHeader title="Playground" backUrl="/dashboard" backLabel="Exit" />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col h-[calc(100vh-4rem)]">
        <div className="mb-6 shrink-0 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900 tracking-tight flex items-center gap-2">
              /{endpoint.path}
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0 bg-zinc-200 text-zinc-700 tracking-wider">
               {endpoint.type}
              </span>
            </h1>
            <p className="text-sm text-zinc-500 font-mono mt-1 opacity-80">{fullUrl}</p>
          </div>
        </div>

        <PreviewClient endpoint={endpoint} fullUrl={fullUrl} />
      </main>
    </div>
  )
}
