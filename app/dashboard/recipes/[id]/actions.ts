'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function logServing(recipeId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('store_id')
    .eq('id', user.id)
    .single()
  if (!profile) return { error: 'Profile not found.' }

  const today = new Date().toISOString().split('T')[0]

  const { data: recipe } = await supabase
    .from('recipes')
    .select('served_dates, store_id')
    .eq('id', recipeId)
    .single()

  if (!recipe) return { error: 'Recipe not found.' }
  if (recipe.store_id !== profile.store_id) return { error: 'Not authorized.' }

  if ((recipe.served_dates as string[]).includes(today)) {
    return { error: 'Today is already logged for this recipe.' }
  }

  const newDates = [...(recipe.served_dates as string[]), today].sort()

  const { error } = await admin
    .from('recipes')
    .update({ served_dates: newDates, recipe_date: today })
    .eq('id', recipeId)

  if (error) return { error: 'Failed to log serving.' }

  revalidatePath(`/dashboard/recipes/${recipeId}`)
  return {}
}

export async function deleteRecipe(recipeId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const admin = createAdminClient()
  const [{ data: recipe }, { data: profile }] = await Promise.all([
    admin.from('recipes').select('uploaded_by, store_id').eq('id', recipeId).single(),
    admin.from('profiles').select('store_id, role').eq('id', user.id).single(),
  ])

  if (!recipe) return { error: 'Recipe not found.' }

  const canDelete =
    recipe.uploaded_by === user.id ||
    (profile?.role === 'admin' && profile?.store_id === recipe.store_id)

  if (!canDelete) return { error: 'Not authorized.' }

  const { error } = await admin.from('recipes').delete().eq('id', recipeId)
  if (error) return { error: 'Failed to delete recipe.' }

  redirect('/dashboard/recipes')
}
