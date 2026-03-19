import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CreateEndpointClient } from './CreateEndpointClient'
import { DashboardHeader } from '@/components/DashboardHeader'

export default async function CreateEndpointPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const namespace = user.user_metadata?.namespace || 'default'

  return (
    <div className="min-h-screen bg-[#F9F9FA] flex flex-col">
      <DashboardHeader title="New Endpoint" backUrl="/dashboard" backLabel="Cancel" />

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-10 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Create Mock Endpoint</h1>
          <p className="text-sm font-medium text-zinc-500 mt-1">Configure your dynamic API path and data schema.</p>
        </div>

        <CreateEndpointClient namespace={namespace} />
      </main>
    </div>
  )
}
