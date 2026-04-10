'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { normaliseImage } from '@/lib/images'

async function uploadToStorage(
  buffer: Buffer,
  path: string,
  contentType: string
): Promise<string | null> {
  const admin = createAdminClient()
  const { error } = await admin.storage
    .from('recipe-cards')
    .upload(path, buffer, { contentType })
  if (error) return null
  const {
    data: { publicUrl },
  } = admin.storage.from('recipe-cards').getPublicUrl(path)
  return publicUrl
}

type UpdateResult = { error: string } | undefined

export async function updateRecipe(
  recipeId: string,
  formData: FormData
): Promise<UpdateResult> {
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

  const canEdit =
    recipe.uploaded_by === user.id ||
    (profile?.role === 'admin' && profile?.store_id === recipe.store_id)

  if (!canEdit) return { error: 'Not authorized.' }

  const title = (formData.get('title') as string)?.trim()
  if (!title) return { error: 'Title is required.' }

  // Handle optional new food photo
  let thumbnailUrl: string | null = (formData.get('existing_thumbnail_url') as string) || null
  const foodFile = formData.get('food_photo') as File | null
  if (foodFile?.size) {
    const { buffer, contentType, ext } = await normaliseImage(foodFile)
    const path = `${recipe.store_id}/photos/${crypto.randomUUID()}.${ext}`
    const uploaded = await uploadToStorage(buffer, path, contentType)
    if (uploaded) thumbnailUrl = uploaded
  }

  // Handle optional new recipe card photo
  let imageUrl: string | null = (formData.get('existing_image_url') as string) || null
  const cardFile = formData.get('card_photo') as File | null
  if (cardFile?.size) {
    const { buffer, contentType, ext } = await normaliseImage(cardFile)
    const path = `${recipe.store_id}/cards/${crypto.randomUUID()}.${ext}`
    const uploaded = await uploadToStorage(buffer, path, contentType)
    if (uploaded) imageUrl = uploaded
  }

  const split = (val: string) =>
    (val ?? '').split(',').map((s) => s.trim()).filter(Boolean)

  let ingredients: unknown[] = []
  try {
    ingredients = JSON.parse(formData.get('ingredients') as string)
  } catch {
    ingredients = []
  }

  const { error } = await admin
    .from('recipes')
    .update({
      title,
      description: (formData.get('description') as string)?.trim() || null,
      ingredients,
      instructions: (formData.get('instructions') as string)?.trim() || '',
      servings: (formData.get('servings') as string)?.trim() || null,
      prep_time: (formData.get('prep_time') as string)?.trim() || null,
      cook_time: (formData.get('cook_time') as string)?.trim() || null,
      tags: split(formData.get('tags') as string),
      thumbnail_url: thumbnailUrl,
      image_url: imageUrl,
    })
    .eq('id', recipeId)

  if (error) return { error: 'Failed to save changes. Please try again.' }

  redirect(`/dashboard/recipes/${recipeId}`)
}
