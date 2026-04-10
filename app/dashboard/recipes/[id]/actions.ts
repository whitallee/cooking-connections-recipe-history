'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

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
