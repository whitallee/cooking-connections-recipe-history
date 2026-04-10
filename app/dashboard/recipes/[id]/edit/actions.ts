'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

async function normaliseImage(
  file: File
): Promise<{ buffer: Buffer; contentType: string; ext: string }> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const isHeic =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    ext === 'heic' ||
    ext === 'heif'

  if (isHeic) {
    const { default: convert } = await import('heic-convert')
    const converted = await convert({
      buffer: await file.arrayBuffer(),
      format: 'JPEG',
      quality: 0.9,
    })
    return { buffer: Buffer.from(converted), contentType: 'image/jpeg', ext: 'jpg' }
  }

  return { buffer: Buffer.from(await file.arrayBuffer()), contentType: file.type, ext }
}

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
  const { data: recipe } = await admin
    .from('recipes')
    .select('uploaded_by, store_id')
    .eq('id', recipeId)
    .single()

  if (!recipe) return { error: 'Recipe not found.' }
  if (recipe.uploaded_by !== user.id) return { error: 'Not authorized.' }

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
      promo_products: split(formData.get('promo_products') as string),
      thumbnail_url: thumbnailUrl,
      image_url: imageUrl,
    })
    .eq('id', recipeId)

  if (error) return { error: 'Failed to save changes. Please try again.' }

  redirect(`/dashboard/recipes/${recipeId}`)
}
