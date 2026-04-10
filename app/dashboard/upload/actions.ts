'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import OpenAI from 'openai'
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

// ─── Extract from recipe card ────────────────────────────────

type ExtractResult =
  | { error: string }
  | { cardUrl: string; data: Record<string, unknown> }

export async function extractFromCard(
  formData: FormData
): Promise<ExtractResult> {
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

  const file = formData.get('card') as File
  if (!file?.size) return { error: 'No file provided.' }

  const { buffer, contentType, ext } = await normaliseImage(file, { maxPx: 2000, quality: 90 })
  const path = `${profile.store_id}/cards/${crypto.randomUUID()}.${ext}`
  const cardUrl = await uploadToStorage(buffer, path, contentType)
  if (!cardUrl) return { error: 'Failed to upload image. Please try again.' }

  const openai = new OpenAI()
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Extract all recipe information from this recipe card image. Return a JSON object with exactly these fields (use empty string or empty array if information is not present):
{
  "title": "recipe name",
  "description": "brief description if present, otherwise empty string",
  "servings": "e.g. 4 servings",
  "prep_time": "e.g. 10 min",
  "cook_time": "e.g. 25 min",
  "ingredients": [{ "quantity": "amount", "unit": "unit of measure or empty string", "item": "ingredient name" }],
  "instructions": "full step-by-step instructions as a single string, newline between each step",
  "tags": ["relevant tags like vegetarian, quick, gluten-free, etc"]
}`,
          },
          { type: 'image_url', image_url: { url: cardUrl } },
        ],
      },
    ],
  })

  const content = response.choices[0].message.content
  if (!content) return { error: 'Could not read the recipe card. Please try again.' }

  try {
    const data = JSON.parse(content)
    return { cardUrl, data }
  } catch {
    return { error: 'Could not parse extracted data. Please fill in the form manually.' }
  }
}

// ─── Save recipe ─────────────────────────────────────────────

type SaveResult = { error: string } | undefined

export async function saveRecipe(formData: FormData): Promise<SaveResult> {
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

  const title = (formData.get('title') as string)?.trim()
  if (!title) return { error: 'Title is required.' }

  // Upload food thumbnail if provided
  let thumbnailUrl: string | null = null
  const foodFile = formData.get('food_photo') as File | null
  if (foodFile?.size) {
    const { buffer, contentType, ext } = await normaliseImage(foodFile)
    const path = `${profile.store_id}/photos/${crypto.randomUUID()}.${ext}`
    thumbnailUrl = await uploadToStorage(buffer, path, contentType)
  }

  // Parse structured fields
  let ingredients: unknown[] = []
  try {
    ingredients = JSON.parse(formData.get('ingredients') as string)
  } catch {
    ingredients = []
  }

  const split = (val: string) =>
    (val ?? '').split(',').map((s) => s.trim()).filter(Boolean)

  const rawOcr = formData.get('raw_ocr_data') as string
  const cardUrl = (formData.get('card_url') as string) || null
  const recipeDate = (formData.get('recipe_date') as string) || new Date().toISOString().split('T')[0]

  const { data: recipe, error } = await supabase
    .from('recipes')
    .insert({
      store_id: profile.store_id,
      uploaded_by: user.id,
      title,
      description: (formData.get('description') as string)?.trim() || null,
      ingredients,
      instructions: (formData.get('instructions') as string)?.trim() || '',
      servings: (formData.get('servings') as string)?.trim() || null,
      prep_time: (formData.get('prep_time') as string)?.trim() || null,
      cook_time: (formData.get('cook_time') as string)?.trim() || null,
      tags: split(formData.get('tags') as string),
      image_url: cardUrl,
      thumbnail_url: thumbnailUrl,
      raw_ocr_data: rawOcr ? JSON.parse(rawOcr) : null,
      recipe_date: recipeDate,
      served_dates: [recipeDate],
    })
    .select('id')
    .single()

  if (error) return { error: 'Failed to save recipe. Please try again.' }

  redirect(`/dashboard/recipes/${recipe.id}`)
}
