export type Role = 'chef' | 'admin'

export interface Store {
  id: string
  name: string
  created_at: string
}

export interface Profile {
  id: string
  full_name: string
  email: string
  store_id: string
  role: Role
  must_change_password: boolean
  created_at: string
}

export interface Ingredient {
  item: string
  quantity: string
  unit: string
}

export interface Recipe {
  id: string
  store_id: string
  uploaded_by: string
  title: string
  description: string | null
  ingredients: Ingredient[]
  instructions: string
  servings: string | null
  prep_time: string | null
  cook_time: string | null
  tags: string[]
  promo_products: string[]
  image_url: string | null
  thumbnail_url: string | null
  raw_ocr_data: Record<string, unknown> | null
  recipe_date: string
  served_dates: string[]
  is_featured: boolean
  featured_end_date: string | null
  created_at: string
  updated_at: string
}
