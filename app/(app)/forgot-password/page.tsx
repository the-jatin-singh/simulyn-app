import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { SubmitButton } from '@/components/SubmitButton'
import { SimulynLogo } from '@/components/SimulynLogo'
import { Mail, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage({ searchParams }: { searchParams: { message: string, error: string } }) {
  const resetPassword = async (formData: FormData) => {
    'use server'
    const email = formData.get('email') as string
    const supabase = await createClient()
    const origin = (await headers()).get('origin')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/update-password`,
    })

    if (error) {
      return redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`)
    }

    return redirect('/forgot-password?message=Check your email for a password reset link.')
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
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Reset password</h1>
            <p className="text-[13px] text-zinc-500 mt-1.5 font-medium">Enter your email and we'll send a link to reset your password.</p>
          </div>

          <form action={resetPassword} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[13px] font-semibold text-zinc-900 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="you@example.com"
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
            
            {searchParams?.message && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-[13px] font-medium rounded-lg border border-emerald-100">
                {searchParams.message}
              </div>
            )}

            <SubmitButton pendingText="Sending link...">
              Send reset link
            </SubmitButton>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-zinc-500 hover:text-zinc-900 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
