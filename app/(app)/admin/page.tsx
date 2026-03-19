import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader } from '@/components/DashboardHeader'
import { AdminClient } from './AdminClient'
import { Shield, Users } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Panel',
  robots: { index: false, follow: false }, // never index admin pages
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check that the current user is an admin or owner
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!currentProfile || !['admin', 'owner'].includes(currentProfile.role)) {
    redirect('/dashboard')
  }

  // Fetch all profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, namespace, role, is_banned, created_at')
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-[#F9F9FA] flex flex-col">
      <DashboardHeader title="Admin Panel" isAdmin={true} adminRole={currentProfile.role as 'admin' | 'owner'} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <Shield className="w-4 h-4 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Admin Panel</h1>
          </div>
          <p className="text-sm text-zinc-500 font-medium ml-11">
            Manage users, permissions, and account status.
            {currentProfile.role === 'owner' && (
              <span className="ml-2 text-amber-600 font-semibold">
                You are the owner — you can promote/demote admins.
              </span>
            )}
          </p>
        </div>

        {profiles && profiles.length > 0 ? (
          <AdminClient
            profiles={profiles as any}
            currentUserId={user.id}
            currentRole={currentProfile.role as 'admin' | 'owner'}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-zinc-300 rounded-xl bg-white/50">
            <Users className="w-10 h-10 text-zinc-300 mb-4" />
            <p className="text-sm text-zinc-500 font-medium">No profiles found.</p>
            <p className="text-xs text-zinc-400 mt-1">Run the migration and backfill SQL to populate this table.</p>
          </div>
        )}
      </main>
    </div>
  )
}
