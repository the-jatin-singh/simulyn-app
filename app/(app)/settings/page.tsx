import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader } from '@/components/DashboardHeader'
import Link from 'next/link'
import { Settings as SettingsIcon, Mail, Fingerprint, Key, ShieldCheck, ArrowRight, LogOut, Crown, Shield, User as UserIcon, LayoutDashboard } from 'lucide-react'
import { logout } from '@/app/(app)/login/actions'

const ROLE_LABELS: Record<string, string> = { owner: 'Owner', admin: 'Admin', user: 'User' }
const ROLE_STYLES: Record<string, string> = {
  owner: 'bg-amber-50 text-amber-700 border-amber-200',
  admin: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  user: 'bg-zinc-50 text-zinc-600 border-zinc-200',
}
const ROLE_ICONS: Record<string, any> = { owner: Crown, admin: Shield, user: UserIcon }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const namespace = user.user_metadata?.namespace || user.email

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = (profile?.role as string) ?? 'user'
  const isAdmin = ['admin', 'owner'].includes(role)
  const RoleIcon = ROLE_ICONS[role] ?? UserIcon

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <DashboardHeader title="Settings" isAdmin={isAdmin} adminRole={isAdmin ? (role as 'admin' | 'owner') : undefined} />
      
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-zinc-400" /> Account Settings
          </h1>
          <p className="text-sm text-zinc-500 mt-2">Manage your account profile, namespace, and authentication settings.</p>
        </div>

        <div className="grid gap-8">
          {/* Profile Section */}
          <section className="bg-white rounded-2xl shadow-sm border border-zinc-200/80 overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-zinc-400" />
                <h2 className="text-[15px] font-bold text-zinc-900">Profile Details</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="flex items-center gap-1.5 text-[13px] font-semibold text-zinc-900 mb-1.5"><Mail className="w-4 h-4 text-zinc-400" /> Email Address</label>
                  <div className="text-[14px] text-zinc-700 font-medium bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 opacity-70 cursor-not-allowed">
                    {user.email}
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1.5">Your email address cannot be changed at this time.</p>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-zinc-900 mb-1.5">Unique Namespace</label>
                  <div className="text-[14px] text-zinc-700 font-mono bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 opacity-70 cursor-not-allowed">
                    {namespace}
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1.5">This namespace prefixes all your mock endpoints permanently.</p>
                </div>

                {isAdmin && (
                  <div>
                    <label className="flex items-center gap-1.5 text-[13px] font-semibold text-zinc-900 mb-1.5"><ShieldCheck className="w-4 h-4 text-zinc-400" /> Account Role</label>
                    <div className={`inline-flex items-center gap-1.5 text-[13px] font-semibold px-3 py-2 rounded-lg border ${ROLE_STYLES[role]}`}>
                      <RoleIcon className="w-4 h-4" />
                      {ROLE_LABELS[role]}
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1.5">Your permission level on this platform.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Admin Panel Section — admin/owner only */}
          {isAdmin && (
            <section className="bg-white rounded-2xl shadow-sm border border-indigo-200/60 overflow-hidden">
              <div className="px-6 py-5 border-b border-indigo-50 flex items-center justify-between bg-indigo-50/50">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-500" />
                  <h2 className="text-[15px] font-bold text-zinc-900">Admin Panel</h2>
                </div>
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${ROLE_STYLES[role]}`}>
                  {ROLE_LABELS[role]}
                </span>
              </div>
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                      <LayoutDashboard className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-zinc-900">User Management</h3>
                      <p className="text-[13px] text-zinc-500 mt-0.5 leading-relaxed">
                        View all registered users, manage ban status
                        {role === 'owner' ? ', and promote or demote admins.' : '.'}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/admin"
                    className="flex items-center justify-center gap-2 shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white transition-all font-semibold text-[13px] px-6 h-10 rounded-lg shadow-sm"
                  >
                    Open <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* Security Section */}
          <section className="bg-white rounded-2xl shadow-sm border border-zinc-200/80 overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-zinc-400" />
                <h2 className="text-[15px] font-bold text-zinc-900">Security</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 ring-1 ring-inset ring-zinc-50">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                    <Key className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-zinc-900">Change Password</h3>
                    <p className="text-[13px] text-zinc-500 mt-0.5 leading-relaxed">Update your password to keep your mock data secure and prevent unauthorized endpoint deployment.</p>
                  </div>
                </div>
                
                <Link 
                  href="/update-password" 
                  className="flex items-center justify-center gap-2 shrink-0 bg-white border border-zinc-200 text-zinc-700 hover:text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50 transition-all font-semibold text-[13px] px-6 h-10 rounded-lg shadow-sm"
                >
                  Update <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="bg-white rounded-2xl shadow-sm border border-zinc-200/80 overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <h3 className="text-[14px] font-bold text-zinc-900">Sign Out</h3>
                  <p className="text-[13px] text-zinc-500 mt-0.5">Log out of your Simulyn account on this device.</p>
                </div>
                <form action={logout}>
                  <button className="flex items-center justify-center gap-2 shrink-0 bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 transition-all font-semibold text-[13px] px-6 h-10 rounded-lg shadow-sm">
                    <LogOut className="w-4 h-4" /> Log Out
                  </button>
                </form>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
