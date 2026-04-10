# Cooking Connections — Recipe History

A store-scoped recipe archive for the Cooking Connections sampling kitchen. Customers scan a QR code to browse past recipes and see what's currently featured. Culinary Selling Partners (chefs) log in to upload recipe cards, which are processed by AI vision to extract structured data before saving.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| OCR / Vision | OpenAI GPT-4o Vision |
| Image Processing | Sharp |
| Hosting | Vercel |

---

## URL Structure

```
/                          → Store finder (auto-redirects if only one store)
/[storeId]                 → Customer page: featured recipes + search archive
/[storeId]/recipe/[id]     → Individual recipe detail + save photo

/login                     → Culinary Selling Partner login
/change-password           → Forced password change on first login
/dashboard                 → Chef home (recent uploads, quick actions)
/dashboard/upload          → Upload a new recipe card via OCR
/dashboard/recipes         → View and manage your uploaded recipes
/dashboard/recipes/[id]    → Recipe detail: served dates, log serving, edit, delete
/dashboard/recipes/[id]/edit → Edit a saved recipe

/admin                     → Redirects to /admin/users
/admin/users               → Manage partner accounts and send invites
/admin/recipes             → Manage all store recipes, toggle featured status
```

> There is no public `/signup` route. All chef accounts are created by admins via the invite form at `/admin/users`.

---

## Database Schema

### `stores`
| Column | Type | Notes |
|---|---|---|
| `id` | `TEXT` (PK) | Corporate store number, e.g. `"451"` |
| `name` | `TEXT` | Store display name |

### `profiles`
Extends Supabase `auth.users`. One row per chef account.

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` (PK) | References `auth.users.id` |
| `full_name` | `TEXT` | |
| `email` | `TEXT` | |
| `store_id` | `TEXT` | References `stores.id` |
| `role` | `TEXT` | `'chef'` or `'admin'` |
| `must_change_password` | `BOOLEAN` | `true` on creation; cleared after first password change |

### `recipes`
| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` (PK) | |
| `store_id` | `TEXT` | Copied from uploader's profile |
| `uploaded_by` | `UUID` | References `profiles.id` |
| `title` | `TEXT` | |
| `description` | `TEXT` | Optional |
| `ingredients` | `JSONB` | Array of `{ item, quantity, unit }` |
| `instructions` | `TEXT` | |
| `servings` | `TEXT` | e.g. `"4–6 servings"` |
| `prep_time` | `TEXT` | e.g. `"10 min"` |
| `cook_time` | `TEXT` | e.g. `"25 min"` |
| `tags` | `TEXT[]` | |
| `promo_products` | `TEXT[]` | Products on sale featured in the recipe |
| `image_url` | `TEXT` | Recipe card photo URL (Supabase Storage) |
| `thumbnail_url` | `TEXT` | Food photo URL (Supabase Storage) |
| `raw_ocr_data` | `JSONB` | Full OpenAI Vision response, kept for debugging |
| `recipe_date` | `DATE` | Most recently served date — used for sorting |
| `served_dates` | `DATE[]` | All dates this recipe has been served |
| `is_featured` | `BOOLEAN` | Set by admin only |
| `featured_end_date` | `DATE` | Featured status expires after this date |
| `created_at` | `TIMESTAMPTZ` | |
| `updated_at` | `TIMESTAMPTZ` | Auto-updated via trigger |

> **Featured logic:** A recipe is actively featured when `is_featured = true AND (featured_end_date IS NULL OR featured_end_date >= CURRENT_DATE)`.

> **Date filtering:** Customer date range search queries `served_dates` (not just `recipe_date`) via the `search_store_recipes` Postgres function so any serving occasion is matched.

---

## Key Feature Flows

### Customer — Browse Recipes
1. Scan QR code → land on `/[storeId]`
2. Featured recipes appear at top (active only)
3. Full archive below with search + date range filter (searches all served dates)
4. Click any recipe → detail page with food photo, ingredients, instructions, and recipe card image
5. "Save Photo" button triggers native share sheet on mobile or browser download on desktop

### Chef — Upload a Recipe Card
1. Log in → `/dashboard/upload`
2. Photograph or select a recipe card image (JPEG, PNG, WebP, or HEIC)
3. Image is normalised via Sharp, uploaded to Supabase Storage, then sent to GPT-4o Vision
4. Extracted fields pre-fill the form — chef reviews and corrects before saving
5. On submit: recipe saved with `store_id` from profile, `recipe_date` and `served_dates` seeded to today

### Chef — Log Another Serving
1. Open any recipe from `/dashboard/recipes`
2. Click "Log serving for today" — available to any chef at the same store
3. Today's date is appended to `served_dates` and `recipe_date` is updated

### Admin — Feature a Recipe
1. `/admin/recipes` → find a recipe → set an optional end date → click "Feature"
2. Recipe appears in the featured section on the customer page until end date passes

### Admin — Invite a New Chef
1. `/admin/users` → fill out name, email, store, and temporary password
2. Account created via Supabase service role (no email confirmation step)
3. Chef logs in with temp credentials → forced to `/change-password` before accessing anything else

---

## Roles & Permissions

| Action | Customer | Chef | Admin |
|---|---|---|---|
| Browse recipes | Yes | Yes | Yes |
| Save recipe photo | Yes | Yes | Yes |
| Upload recipe card | No | Yes | Yes |
| Log a serving | No | Yes (same store) | Yes (same store) |
| Edit own recipe | No | Yes | Yes |
| Edit any store recipe | No | No | Yes (same store) |
| Delete recipe | No | Yes (own) | Yes (same store) |
| Mark recipe as featured | No | No | Yes |
| Invite / manage chefs | No | No | Yes |

RLS policies in Supabase enforce these at the database level.

---

## Image Processing

All uploaded images (food photos and recipe cards) are run through Sharp before storage:
- HEIC/HEIF files are converted to JPEG
- Images are resized to fit within a max dimension (2000px for recipe cards, 1600px for food photos)
- Compressed to JPEG at 85–90% quality

The header logo and favicon are pre-generated smaller variants in `/public` and `/app`.

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

> `SUPABASE_SERVICE_ROLE_KEY` is server-side only. Never expose it to the client.

---

## Deploying to Vercel

1. Add the four environment variables above in the Vercel project settings
2. In Supabase → **Auth → URL Configuration**: add your `https://your-app.vercel.app` to allowed redirect URLs
3. In Supabase → **Storage**: confirm the `recipe-cards` bucket exists and is set to public
4. If using a fresh production Supabase project, run `supabase/schema.sql` then the `search_store_recipes` function from the setup notes

---

## Remaining TODOs

- **Duplicate recipe detection** — warn the chef during upload if a recipe with the same title already exists, and offer "log as another serving" instead of creating a duplicate
- **Forgot password flow** — currently no self-service password reset; admins must handle resets via the Supabase dashboard
- **Accessibility pass** — keyboard navigation and screen reader review across all forms
- **Tag search on customer page** — date and text search exist; filtering by tag does not
