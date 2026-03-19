import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EditEndpointClient } from './EditEndpointClient'
import { DashboardHeader } from '@/components/DashboardHeader'

export default async function EditEndpointPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: endpoint } = await supabase
    .from('endpoints')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!endpoint) {
    redirect('/dashboard')
  }

  const namespace = user.user_metadata?.namespace || user.email

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 font-sans">
      <DashboardHeader 
        backUrl={`/endpoints/${id}`}
        backLabel="Back to Preview"
      />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-65px)]">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Edit Endpoint</h1>
          <p className="text-sm text-zinc-500 mt-1">Reconfigure strict API matching for <span className="font-mono bg-zinc-100 px-1 rounded">/{endpoint.path}</span></p>
        </div>

        <div className="h-[calc(100%-80px)]">
          <EditEndpointClient endpoint={endpoint} namespace={namespace} />
        </div>
      </main>
    </div>
  )
}
