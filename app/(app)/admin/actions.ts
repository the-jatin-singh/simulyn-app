'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getAdminClient() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'owner'].includes(profile.role)) {
    throw new Error('Insufficient permissions')
  }

  return { supabase, profile }
}

export async function banUser(userId: string) {
  const { supabase } = await getAdminClient()
  const { error } = await supabase
    .from('profiles')
    .update({ is_banned: true })
    .eq('id', userId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function unbanUser(userId: string) {
  const { supabase } = await getAdminClient()
  const { error } = await supabase
    .from('profiles')
    .update({ is_banned: false })
    .eq('id', userId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function setUserRole(userId: string, role: 'user' | 'admin') {
  const { supabase, profile } = await getAdminClient()
  // Only owner can change roles
  if (profile.role !== 'owner') throw new Error('Only the owner can change user roles')
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}
