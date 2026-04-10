'use client'

import { useState } from 'react'
import { updateRecipe } from './actions'
import type { Ingredient } from '@/lib/supabase/types'

const emptyIngredient = (): Ingredient => ({ quantity: '', unit: '', item: '' })

function PhotoInput({
  id,
  label,
  preview,
  onChange,
}: {
  id: string
  label: string
  preview: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="max-h-64 w-full rounded-lg border border-zinc-200 object-contain bg-zinc-50"
          />
          <label
            htmlFor={id}
            className="absolute bottom-2 right-2 cursor-pointer rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-zinc-700 shadow hover:bg-white transition-colors"
          >
            Replace
            <input
              id={id}
              type="file"
              accept="image/*,image/heic,image/heif"
              className="sr-only"
              onChange={onChange}
            />
          </label>
        </div>
      ) : (
        <label
          htmlFor={id}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-200 bg-white px-6 py-10 text-center hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
        >
          <svg className="h-8 w-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <span className="text-sm text-zinc-500">Tap to take a photo or choose a file</span>
          <input
            id={id}
            type="file"
            accept="image/*,image/heic,image/heif"
            className="sr-only"
            onChange={onChange}
          />
        </label>
      )}
    </div>
  )
}

interface Props {
  recipeId: string
  initial: {
    title: string
    description: string
    servings: string
    prepTime: string
    cookTime: string
    instructions: string
    ingredients: Ingredient[]
    tags: string
    promoProducts: string
    thumbnailUrl: string
    imageUrl: string
  }
}

export default function EditForm({ recipeId, initial }: Props) {
  const [title, setTitle] = useState(initial.title)
  const [description, setDescription] = useState(initial.description)
  const [servings, setServings] = useState(initial.servings)
  const [prepTime, setPrepTime] = useState(initial.prepTime)
  const [cookTime, setCookTime] = useState(initial.cookTime)
  const [instructions, setInstructions] = useState(initial.instructions)
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initial.ingredients.length > 0 ? initial.ingredients : [emptyIngredient()]
  )
  const [tags, setTags] = useState(initial.tags)
  const [promoProducts, setPromoProducts] = useState(initial.promoProducts)

  const [foodFile, setFoodFile] = useState<File | null>(null)
  const [foodPreview, setFoodPreview] = useState(initial.thumbnailUrl)

  const [cardFile, setCardFile] = useState<File | null>(null)
  const [cardPreview, setCardPreview] = useState(initial.imageUrl)

  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  function handleFoodChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFoodFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setFoodPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  function handleCardChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCardFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setCardPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  function addIngredient() {
    setIngredients((prev) => [...prev, emptyIngredient()])
  }

  function removeIngredient(i: number) {
    setIngredients((prev) => prev.filter((_, idx) => idx !== i))
  }

  function updateIngredient(i: number, field: keyof Ingredient, value: string) {
    setIngredients((prev) =>
      prev.map((ing, idx) => (idx === i ? { ...ing, [field]: value } : ing))
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setSaveError('Title is required.')
      return
    }

    setIsSaving(true)
    setSaveError('')

    const fd = new FormData()
    fd.append('title', title)
    fd.append('description', description)
    fd.append('servings', servings)
    fd.append('prep_time', prepTime)
    fd.append('cook_time', cookTime)
    fd.append('instructions', instructions)
    fd.append('ingredients', JSON.stringify(ingredients.filter((i) => i.item.trim())))
    fd.append('tags', tags)
    fd.append('promo_products', promoProducts)
    fd.append('existing_thumbnail_url', initial.thumbnailUrl)
    fd.append('existing_image_url', initial.imageUrl)
    if (foodFile) fd.append('food_photo', foodFile)
    if (cardFile) fd.append('card_photo', cardFile)

    const result = await updateRecipe(recipeId, fd)
    if (result?.error) {
      setSaveError(result.error)
      setIsSaving(false)
    }
  }

  const inputClass =
    'rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 w-full'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Basic info */}
      <section className="rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-zinc-900">Recipe info</h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="title" className="text-sm font-medium text-zinc-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="description" className="text-sm font-medium text-zinc-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className={inputClass}
              placeholder="Short description or tagline"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="servings" className="text-sm font-medium text-zinc-700">Servings</label>
              <input id="servings" type="text" value={servings} onChange={(e) => setServings(e.target.value)} className={inputClass} placeholder="e.g. 4 servings" />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="prep_time" className="text-sm font-medium text-zinc-700">Prep time</label>
              <input id="prep_time" type="text" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} className={inputClass} placeholder="e.g. 10 min" />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="cook_time" className="text-sm font-medium text-zinc-700">Cook time</label>
              <input id="cook_time" type="text" value={cookTime} onChange={(e) => setCookTime(e.target.value)} className={inputClass} placeholder="e.g. 25 min" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="tags" className="text-sm font-medium text-zinc-700">Tags</label>
              <input id="tags" type="text" value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} placeholder="quick, vegetarian, …" />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="promo_products" className="text-sm font-medium text-zinc-700">Featured products</label>
              <input id="promo_products" type="text" value={promoProducts} onChange={(e) => setPromoProducts(e.target.value)} className={inputClass} placeholder="Comma-separated" />
            </div>
          </div>
        </div>
      </section>

      {/* Ingredients */}
      <section className="rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-zinc-900">Ingredients</h2>
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-[80px_100px_1fr_32px] gap-2 px-1 text-xs font-medium text-zinc-500">
            <span>Qty</span><span>Unit</span><span>Ingredient</span><span />
          </div>
          {ingredients.map((ing, i) => (
            <div key={i} className="grid grid-cols-[80px_100px_1fr_32px] items-center gap-2">
              <input type="text" value={ing.quantity} onChange={(e) => updateIngredient(i, 'quantity', e.target.value)} className={inputClass} placeholder="1½" />
              <input type="text" value={ing.unit} onChange={(e) => updateIngredient(i, 'unit', e.target.value)} className={inputClass} placeholder="cups" />
              <input type="text" value={ing.item} onChange={(e) => updateIngredient(i, 'item', e.target.value)} className={inputClass} placeholder="pasta" />
              <button
                type="button"
                onClick={() => removeIngredient(i)}
                disabled={ingredients.length === 1}
                className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors disabled:opacity-30"
                aria-label="Remove ingredient"
              >×</button>
            </div>
          ))}
          <button
            type="button"
            onClick={addIngredient}
            className="mt-1 self-start text-sm text-zinc-500 underline underline-offset-2 hover:text-zinc-900 transition-colors"
          >
            + Add ingredient
          </button>
        </div>
      </section>

      {/* Instructions */}
      <section className="rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-zinc-900">Instructions</h2>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={8}
          className={inputClass}
          placeholder="Step-by-step instructions…"
        />
      </section>

      {/* Photos */}
      <section className="rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-zinc-900">Photos</h2>
        <div className="flex flex-col gap-6">
          <PhotoInput
            id="food-upload"
            label="Food photo"
            preview={foodPreview}
            onChange={handleFoodChange}
          />
          <PhotoInput
            id="card-upload"
            label="Recipe card"
            preview={cardPreview}
            onChange={handleCardChange}
          />
        </div>
      </section>

      {saveError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{saveError}</p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
