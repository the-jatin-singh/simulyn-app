import { login } from './actions'
import Link from 'next/link'
import { SubmitButton } from '@/components/SubmitButton'
import { SimulynLogo } from '@/components/SimulynLogo'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-6 flex items-center gap-2 text-zinc-900 font-bold group">
            <SimulynLogo className="h-5 w-auto text-zinc-900 group-hover:text-indigo-600 transition-colors" />
            <span>Simulyn</span>
          </Link>
          <h2 className="text-2xl font-semibold text-zinc-900 tracking-tight mb-2">Welcome back</h2>
          <p className="text-sm text-zinc-500 mb-8">Enter your credentials to access your mock APIs.</p>
          
          <form className="space-y-4" action={login}>
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-1.5">Email address</label>
              <input name="email" type="email" required className="block w-full rounded-md border-0 py-2.5 px-3 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-zinc-900 sm:text-sm sm:leading-6" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-zinc-900">Password</label>
                <Link href="/forgot-password" title="Forgot password?" className="text-[13px] font-medium text-zinc-500 hover:text-indigo-600 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input name="password" type="password" required className="block w-full rounded-md border-0 py-2.5 px-3 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-zinc-900 sm:text-sm sm:leading-6" />
            </div>

            {params?.error && <p className="text-[13px] font-medium text-red-600 bg-red-50 p-3 rounded-md border border-red-100">{params.error as string}</p>}
            {params?.message && <p className="text-[13px] font-medium text-indigo-600 bg-indigo-50 p-3 rounded-md border border-indigo-100">{params.message as string}</p>}

            <SubmitButton>Sign in</SubmitButton>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-500 font-medium">
            Don't have an account? <Link href="/signup" className="text-zinc-900 hover:text-indigo-600 underline underline-offset-4 transition-colors">Sign up</Link>
          </p>
        </div>
      </div>
      <div className="hidden lg:flex flex-1 bg-zinc-900 items-center justify-center relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
         <div className="w-full max-w-sm text-zinc-300 z-10 px-8 border-l border-zinc-700/50 pl-12 -ml-20 border-t pt-8">
            <h3 className="text-2xl font-bold text-white mb-4">Zero backend dependency.</h3>
            <p className="text-sm leading-relaxed opacity-80">Stop waiting for APIs. Define realistic robust data endpoints inside your local dev workflow in seconds.</p>
         </div>
      </div>
    </div>
  )
}
