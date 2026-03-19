import Link from 'next/link'
import { ArrowLeft, Settings, Shield } from 'lucide-react'
import { SimulynLogo } from './SimulynLogo'

export function DashboardHeader({ 
  userTitle, 
  title, 
  backUrl, 
  backLabel,
  isAdmin,
  adminRole,
}: { 
  userTitle?: string, 
  title?: string, 
  backUrl?: string, 
  backLabel?: string,
  isAdmin?: boolean,
  adminRole?: 'admin' | 'owner',
}) {
  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-zinc-100 px-6 sm:px-8 h-14 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="font-semibold tracking-tight text-zinc-900 flex items-center gap-2.5 group">
          <SimulynLogo className="h-[18px] w-auto text-zinc-900 group-hover:text-indigo-600 transition-colors" />
          <span className="hidden sm:inline text-[14px]">Simulyn</span>
        </Link>
        
        {backUrl && (
          <>
            <div className="h-4 w-px bg-zinc-200 hidden sm:block"></div>
            <Link href={backUrl} className="flex items-center gap-1.5 text-[12px] font-semibold text-zinc-500 hover:text-zinc-900 transition-colors px-2 py-1.5 -ml-2 rounded-md hover:bg-zinc-100">
              <ArrowLeft className="w-3.5 h-3.5" /> 
              <span>{backLabel || 'Back'}</span>
            </Link>
          </>
        )}
        
        {(userTitle || title) && (
          <>
            <div className="h-4 w-px bg-zinc-200"></div>
            <span className="text-[13px] font-semibold text-zinc-700">{userTitle || title}</span>
          </>
        )}

        {/* Role tag — subtle dot + label, only for admin/owner */}
        {adminRole && (
          <span className={`hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold ${
            adminRole === 'owner' ? 'text-amber-600' : 'text-indigo-600'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              adminRole === 'owner' ? 'bg-amber-400' : 'bg-indigo-400'
            }`} />
            {adminRole === 'owner' ? 'Owner' : 'Admin'}
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-1 pr-1">
        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-all text-[12px] font-semibold"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
        )}
        <Link href="/settings" className="flex items-center justify-center w-9 h-9 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all">
          <Settings className="w-[17px] h-[17px]" />
        </Link>
      </div>
    </header>
  )
}

