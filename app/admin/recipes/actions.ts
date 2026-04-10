'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

async function getAdminStoreId(userId: string): Promise<string | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('profiles')
    .select('store_id, role')
    .eq('id', userId)
    .single()
  if (data?.role !== 'admin') return null
  return data.store_id
}

export async function featureRecipe(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const storeId = await getAdminStoreId(user.id)
  if (!storeId) return

  const recipeId = formData.get('recipe_id') as string
  const endDate = (formData.get('featured_end_date') as string) || null

  const admin = createAdminClient()

  // Verify the recipe belongs to this admin's store
  const { data: recipe } = await admin
    .from('recipes')
    .select('store_id')
    .eq('id', recipeId)
    .single()
  if (recipe?.store_id !== storeId) return

  await admin
    .from('recipes')
    .update({ is_featured: true, featured_end_date: endDate })
    .eq('id', recipeId)

  revalidatePath('/admin/recipes')
}

export async function unfeatureRecipe(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const storeId = await getAdminStoreId(user.id)
  if (!storeId) return

  const recipeId = formData.get('recipe_id') as string

  const admin = createAdminClient()

  const { data: recipe } = await admin
    .from('recipes')
    .select('store_id')
    .eq('id', recipeId)
    .single()
  if (recipe?.store_id !== storeId) return

  await admin
    .from('recipes')
    .update({ is_featured: false, featured_end_date: null })
    .eq('id', recipeId)

  revalidatePath('/admin/recipes')
}
