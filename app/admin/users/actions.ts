'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

type InviteState =
  | { error: string }
  | { success: true; email: string; tempPassword: string }
  | null

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')
  return user
}

export async function invitePartner(
  _prevState: InviteState,
  formData: FormData
): Promise<InviteState> {
  await requireAdmin()

  const fullName = formData.get('full_name') as string
  const email = formData.get('email') as string
  const storeId = formData.get('store_id') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (!fullName || !email || !storeId || !password)
    return { error: 'All fields are required.' }
  if (password !== confirmPassword)
    return { error: 'Passwords do not match.' }
  if (password.length < 8)
    return { error: 'Password must be at least 8 characters.' }

  const admin = createAdminClient()

  const { data: newUser, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

  if (createError) {
    if (createError.message.includes('already registered'))
      return { error: 'An account with that email already exists.' }
    return { error: createError.message }
  }

  const { error: profileError } = await admin.from('profiles').insert({
    id: newUser.user.id,
    full_name: fullName,
    email,
    store_id: storeId,
    role: 'chef',
    must_change_password: true,
  })

  if (profileError) {
    await admin.auth.admin.deleteUser(newUser.user.id)
    return { error: 'Failed to create profile. Please try again.' }
  }

  revalidatePath('/admin/users')
  return { success: true, email, tempPassword: password }
}

export async function updateUserRole(formData: FormData) {
  const currentUser = await requireAdmin()

  const targetId = formData.get('user_id') as string
  const newRole = formData.get('role') as string

  if (!targetId || !['chef', 'admin'].includes(newRole)) return
  if (targetId === currentUser.id) return // prevent self-demotion

  const admin = createAdminClient()
  await admin.from('profiles').update({ role: newRole }).eq('id', targetId)

  revalidatePath('/admin/users')
}
