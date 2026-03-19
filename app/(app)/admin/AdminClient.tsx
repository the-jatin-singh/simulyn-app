'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ShieldCheck, ShieldOff, Shield, Crown, User, ChevronUp, ChevronDown } from 'lucide-react'
import { banUser, unbanUser, setUserRole } from './actions'

type Profile = {
  id: string
  email: string
  namespace: string
  role: 'user' | 'admin' | 'owner'
  is_banned: boolean
  created_at: string
}

const ROLE_CONFIG = {
  owner: { label: 'Owner', icon: Crown,  pill: 'text-amber-600 bg-amber-50 border-amber-200' },
  admin: { label: 'Admin', icon: Shield, pill: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  user:  { label: 'User',  icon: User,   pill: 'text-zinc-500 bg-zinc-50 border-zinc-200' },
}

function RolePill({ role }: { role: Profile['role'] }) {
  const { label, icon: Icon, pill } = ROLE_CONFIG[role]
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${pill}`}>
      <Icon className="w-2.5 h-2.5" />
      {label}
    </span>
  )
}

function GhostButton({
  onClick,
  disabled,
  tone,
  children,
}: {
  onClick: () => void
  disabled: boolean
  tone: 'danger' | 'safe' | 'accent' | 'neutral'
  children: React.ReactNode
}) {
  const cls = {
    danger:  'text-red-500 hover:bg-red-50 hover:text-red-600',
    safe:    'text-emerald-600 hover:bg-emerald-50',
    accent:  'text-indigo-600 hover:bg-indigo-50',
    neutral: 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700',
  }[tone]
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1 text-[12px] font-semibold px-2.5 py-1.5 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${cls}`}
    >
      {children}
    </button>
  )
}

export function AdminClient({
  profiles,
  currentUserId,
  currentRole,
}: {
  profiles: Profile[]
  currentUserId: string
  currentRole: 'admin' | 'owner'
}) {
  const [search, setSearch]           = useState('')
  const [filterRole, setFilterRole]   = useState<'all' | 'user' | 'admin' | 'owner'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'banned'>('all')
  const [pendingId, setPendingId]     = useState<string | null>(null)
  const [isPending, startTransition]  = useTransition()
  const router = useRouter()

  const filtered = useMemo(() =>
    profiles.filter(p => {
      const q = search.toLowerCase()
      const matchSearch = p.email.toLowerCase().includes(q) || (p.namespace || '').toLowerCase().includes(q)
      const matchRole   = filterRole === 'all' || p.role === filterRole
      const matchStatus = filterStatus === 'all' || (filterStatus === 'banned' ? p.is_banned : !p.is_banned)
      return matchSearch && matchRole && matchStatus
    }),
    [profiles, search, filterRole, filterStatus]
  )

  const stats = [
    { label: 'Total',   value: profiles.length,                            accent: 'text-zinc-800' },
    { label: 'Active',  value: profiles.filter(p => !p.is_banned).length,  accent: 'text-emerald-600' },
    { label: 'Banned',  value: profiles.filter(p => p.is_banned).length,   accent: 'text-red-500' },
    { label: 'Admins',  value: profiles.filter(p => p.role === 'admin').length, accent: 'text-indigo-600' },
  ]

  function run(id: string, action: () => Promise<void>) {
    setPendingId(id)
    startTransition(async () => {
      try { await action(); router.refresh() }
      catch (e: any) { alert(e.message) }
      finally { setPendingId(null) }
    })
  }

  return (
    <div className="space-y-5">

      {/* ── Stats row ── */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-zinc-200 rounded-xl px-4 py-3 shadow-sm">
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-0.5">{s.label}</p>
            <p className={`text-[22px] font-bold leading-none ${s.accent}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Table card ── */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">

        {/* Filter bar */}
        <div className="px-5 py-3.5 border-b border-zinc-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users…"
              className="w-full pl-8 pr-3 h-8 text-[13px] border border-zinc-200 rounded-lg bg-zinc-50/50 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:bg-white transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            {(['all', 'user', 'admin', 'owner'] as const).map(r => (
              <button
                key={r}
                onClick={() => setFilterRole(r)}
                className={`text-[12px] font-semibold px-3 h-8 rounded-lg transition-colors capitalize ${
                  filterRole === r
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800'
                }`}
              >
                {r === 'all' ? 'All' : r}
              </button>
            ))}
            <div className="w-px h-4 bg-zinc-200 mx-1" />
            {(['all', 'active', 'banned'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`text-[12px] font-semibold px-3 h-8 rounded-lg transition-colors capitalize ${
                  filterStatus === s
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800'
                }`}
              >
                {s === 'all' ? 'All status' : s}
              </button>
            ))}
          </div>
        </div>

        {/* Column headers */}
        <div className="hidden sm:grid grid-cols-[2.5fr_1fr_1fr_1fr] px-5 py-2 bg-zinc-50/80 border-b border-zinc-100 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          <span>User</span>
          <span>Role</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-zinc-100">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-[13px] text-zinc-400 font-medium">
              No users match your filters.
            </div>
          ) : (
            filtered.map(profile => {
              const isLoadingThis = pendingId === profile.id && isPending
              const isSelf        = profile.id === currentUserId
              const canBan        = !isSelf && profile.role !== 'owner' && (currentRole === 'owner' || profile.role === 'user')
              const canPromote    = currentRole === 'owner' && !isSelf && profile.role !== 'owner'

              return (
                <div
                  key={profile.id}
                  className={`grid sm:grid-cols-[2.5fr_1fr_1fr_1fr] items-center px-5 py-3.5 transition-colors ${
                    isLoadingThis ? 'opacity-60' : profile.is_banned ? 'bg-red-50/30' : 'hover:bg-zinc-50/60'
                  }`}
                >
                  {/* User */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[12px] font-bold text-zinc-500 shrink-0 select-none">
                      {(profile.email?.[0] ?? '?').toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-zinc-900 truncate leading-snug flex items-center gap-1.5">
                        {profile.email}
                        {isSelf && (
                          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 border border-zinc-200 rounded-full px-1.5 py-0.5">you</span>
                        )}
                      </p>
                      {profile.namespace && (
                        <p className="text-[11px] text-zinc-400 font-mono truncate leading-snug">{profile.namespace}</p>
                      )}
                    </div>
                  </div>

                  {/* Role */}
                  <div><RolePill role={profile.role} /></div>

                  {/* Status */}
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${profile.is_banned ? 'bg-red-400' : 'bg-emerald-400'}`} />
                    <span className={`text-[12px] font-semibold ${profile.is_banned ? 'text-red-500' : 'text-zinc-500'}`}>
                      {profile.is_banned ? 'Banned' : 'Active'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5">
                    {canBan && (
                      profile.is_banned ? (
                        <GhostButton tone="safe" disabled={isLoadingThis} onClick={() => run(profile.id, () => unbanUser(profile.id))}>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {isLoadingThis ? 'Unbanning…' : 'Unban'}
                        </GhostButton>
                      ) : (
                        <GhostButton tone="danger" disabled={isLoadingThis} onClick={() => {
                          if (!confirm(`Ban ${profile.email}?`)) return
                          run(profile.id, () => banUser(profile.id))
                        }}>
                          <ShieldOff className="w-3.5 h-3.5" />
                          {isLoadingThis ? 'Banning…' : 'Ban'}
                        </GhostButton>
                      )
                    )}

                    {canPromote && (
                      profile.role === 'admin' ? (
                        <GhostButton tone="neutral" disabled={isLoadingThis} onClick={() => {
                          if (!confirm(`Remove admin from ${profile.email}?`)) return
                          run(profile.id, () => setUserRole(profile.id, 'user'))
                        }}>
                          <ChevronDown className="w-3.5 h-3.5" />
                          {isLoadingThis ? '…' : 'Demote'}
                        </GhostButton>
                      ) : (
                        <GhostButton tone="accent" disabled={isLoadingThis} onClick={() => {
                          if (!confirm(`Make ${profile.email} an admin?`)) return
                          run(profile.id, () => setUserRole(profile.id, 'admin'))
                        }}>
                          <ChevronUp className="w-3.5 h-3.5" />
                          {isLoadingThis ? '…' : 'Promote'}
                        </GhostButton>
                      )
                    )}

                    {!canBan && !canPromote && (
                      <span className="text-[12px] text-zinc-300 px-2.5">—</span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-zinc-100 bg-zinc-50/50">
          <p className="text-[11px] text-zinc-400 font-medium">
            {filtered.length} of {profiles.length} users
          </p>
        </div>
      </div>
    </div>
  )
}
