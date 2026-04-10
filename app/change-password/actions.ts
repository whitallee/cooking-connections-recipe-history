'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

type ActionState = { error: string } | null

export async function changePassword(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (password !== confirm) return { error: 'Passwords do not match.' }
  if (password.length < 8)
    return { error: 'Password must be at least 8 characters.' }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message }

  await supabase
    .from('profiles')
    .update({ must_change_password: false })
    .eq('id', user.id)

  redirect('/dashboard')
}
