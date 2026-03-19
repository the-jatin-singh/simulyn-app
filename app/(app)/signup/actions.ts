'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    namespace: formData.get('namespace') as string,
  }

  if (!data.email || !data.password || !data.namespace) redirect('/signup?error=Missing fields')

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        namespace: data.namespace.toLowerCase().replace(/[^a-z0-9-]/g, ''),
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) redirect(`/signup?error=${error.message}`)

  revalidatePath('/', 'layout')
  redirect('/login?message=Account created! Check email to log in')
}
