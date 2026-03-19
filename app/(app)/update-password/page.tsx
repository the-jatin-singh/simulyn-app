import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SubmitButton } from '@/components/SubmitButton'
import { SimulynLogo } from '@/components/SimulynLogo'
import { Lock, ArrowLeft } from 'lucide-react'

export default async function UpdatePasswordPage({ searchParams }: { searchParams: { message: string, error: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login?error=You must be logged in to update your password.')
  }

  const updatePassword = async (formData: FormData) => {
    'use server'
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      return redirect('/update-password?error=Passwords do not match.')
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      return redirect(`/update-password?error=${encodeURIComponent(error.message)}`)
    }

    return redirect('/dashboard?message=Password updated successfully.')
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-zinc-900 text-lg group">
            <SimulynLogo className="h-6 w-auto text-zinc-900 group-hover:text-indigo-600 transition-colors" />
            Simulyn
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-zinc-200/80">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Set new password</h1>
            <p className="text-[13px] text-zinc-500 mt-1.5 font-medium">Please enter your new password below.</p>
          </div>

          <form action={updatePassword} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-[13px] font-semibold text-zinc-900 mb-1.5">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-4 h-10 bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all shadow-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-[13px] font-semibold text-zinc-900 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-4 h-10 bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all shadow-sm"
                />
              </div>
            </div>

            {searchParams?.error && (
              <div className="p-3 bg-red-50 text-red-700 text-[13px] font-medium rounded-lg border border-red-100">
                {searchParams.error}
              </div>
            )}
            
            <SubmitButton pendingText="Updating...">
              Update password
            </SubmitButton>
          </form>

          <div className="mt-6 text-center">
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-zinc-500 hover:text-zinc-900 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
