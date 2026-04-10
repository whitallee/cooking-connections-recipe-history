# Cooking Connections — Recipe History

A store-scoped recipe archive for the Cooking Connections sampling kitchen. Customers scan a QR code to browse past recipes and see what's currently featured. Culinary Selling Partners (chefs) log in to upload recipe cards, which are processed by AI vision to extract structured data before saving.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 16 (App Router) | Already scaffolded |
| Database | Supabase (PostgreSQL) | Auth + DB + Storage in one platform |
| Auth | Supabase Auth | Built into the platform, no extra service |
| Image Storage | Supabase Storage | Free tier, same client as DB/Auth |
| OCR / Vision | OpenAI GPT-4o Vision | Familiar, strong structured output |
| Hosting | Vercel | Optimal for Next.js App Router |

---

## URL Structure

All customer-facing routes are scoped to a store number so any store can adopt the app by pointing their QR code at their store ID.

```
/                          → Root landing (redirects or shows store lookup)
/[storeId]                 → Customer page: featured recipes + search
/[storeId]/recipe/[id]     → Individual recipe detail + photo

/login                     → Chef login
/change-password           → Forced password change (on first login)
/dashboard                 → Chef home (recent uploads, quick actions)
/dashboard/upload          → Upload a new recipe card
/dashboard/recipes         → Manage your own uploaded recipes
/dashboard/recipes/[id]    → Edit a saved recipe

/admin                     → Admin dashboard (admin role required)
/admin/users               → Manage partner accounts, send invites
/admin/recipes             → Manage all recipes, mark featured
```

> There is no public `/signup` route. All chef accounts are created by admins via the invite form at `/admin/users`.

---

## Database Schema

### `stores`
| Column | Type | Notes |
|---|---|---|
| `id` | `TEXT` (PK) | Corporate store number, e.g. `"451"` |
| `name` | `TEXT` | Store display name |
| `created_at` | `TIMESTAMPTZ` | |

### `profiles`
Extends Supabase `auth.users`. One row per chef account.

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` (PK) | References `auth.users.id` |
| `full_name` | `TEXT` | |
| `store_id` | `TEXT` | References `stores.id`, set by admin at invite time |
| `role` | `TEXT` | `'chef'` or `'admin'`, default `'chef'` |
| `must_change_password` | `BOOLEAN` | `true` on account creation; cleared after first password change |
| `created_at` | `TIMESTAMPTZ` | |

### `recipes`
| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` (PK) | Auto-generated |
| `store_id` | `TEXT` | References `stores.id`, copied from uploader's profile |
| `uploaded_by` | `UUID` | References `profiles.id` |
| `title` | `TEXT` | |
| `description` | `TEXT` | Optional short blurb |
| `ingredients` | `JSONB` | Array of `{ item, quantity, unit }` objects |
| `instructions` | `TEXT` | Step-by-step directions |
| `servings` | `TEXT` | e.g. `"4–6 servings"` |
| `prep_time` | `TEXT` | e.g. `"10 min"` |
| `cook_time` | `TEXT` | e.g. `"25 min"` |
| `tags` | `TEXT[]` | e.g. `["vegetarian", "quick"]` |
| `promo_products` | `TEXT[]` | Products on sale that the recipe features |
| `image_url` | `TEXT` | Public URL from Supabase Storage |
| `raw_ocr_data` | `JSONB` | Full OpenAI Vision response, kept for debugging |
| `recipe_date` | `DATE` | Date the recipe was promoted/cooked — used for customer date filtering |
| `is_featured` | `BOOLEAN` | Set by admin only |
| `featured_end_date` | `DATE` | When the promo ends; featured status is inactive after this date |
| `created_at` | `TIMESTAMPTZ` | |
| `updated_at` | `TIMESTAMPTZ` | |

> **Featured logic:** A recipe is considered actively featured when `is_featured = true AND (featured_end_date IS NULL OR featured_end_date >= CURRENT_DATE)`. End date is set by the admin at the time of featuring — once a coupon period ends the recipe falls off automatically without any manual cleanup.

---

## Key Feature Flows

### Customer — Browse Recipes
1. Scan QR code → land on `/451` (store-scoped)
2. Page loads featured recipes section at top (active featured only)
3. Below: full recipe archive with search bar + date range filter
4. Click any recipe → `/451/recipe/[id]` shows recipe card photo + structured data
5. "Save Photo" button triggers a browser download of the recipe card image

### Chef — Upload a Recipe Card
1. Log in at `/login` → redirected to `/dashboard`
2. Go to `/dashboard/upload`
3. Select or photograph a recipe card image
4. Image uploads to Supabase Storage → returns a public URL
5. URL is sent to OpenAI GPT-4o Vision with a structured extraction prompt
6. Extracted data (title, ingredients, instructions, times, servings) pre-fills a form
7. Chef reviews and edits every field before submitting
8. On submit: recipe row saved with `store_id` from chef's profile, `uploaded_by` set to chef's ID, and `recipe_date` set (defaulting to today, editable)
9. Recipe is immediately searchable by customers of that store

### Admin — Mark a Recipe as Featured
1. Log in with an admin account → `/admin/recipes`
2. Find a recipe, click "Mark as Featured"
3. Set a featured end date (when the promo/coupon ends)
4. Save → `is_featured = true`, `featured_end_date` set
5. Recipe appears in the featured section on the customer page until end date passes

### Admin — Invite a New Chef
1. Admin goes to `/admin/users` → clicks "Invite Partner"
2. Admin fills out: full name, email, store, and a temporary password
3. Server Action uses the Supabase service role key to call `auth.admin.createUser()` — creates the account with `email_confirm: true` (no email confirmation step needed)
4. A `profiles` row is inserted: `store_id` from the form, `role = 'chef'`, `must_change_password = true`
5. Admin shares the email + temporary password with the chef directly (in person or via internal message)

### Chef — First Login (Password Change)
1. Chef logs in at `/login` with the temporary credentials the admin provided
2. After successful auth, the session is checked for `must_change_password = true`
3. Chef is redirected to `/change-password` — they cannot access any other protected route until this is complete
4. Chef sets their new password → Supabase `auth.updateUser()` is called
5. `must_change_password` is set to `false` on the profile
6. Chef is redirected to `/dashboard`

---

## Roles & Permissions

| Action | Guest (Customer) | Chef | Admin |
|---|---|---|---|
| Browse recipes for their store | Yes | Yes | Yes |
| View recipe detail + save photo | Yes | Yes | Yes |
| Upload recipe card | No | Yes | Yes |
| Edit own recipe | No | Yes | Yes |
| Edit any recipe | No | No | Yes |
| Mark recipe as featured | No | No | Yes |
| Manage user roles | No | No | Yes |
| Invite new chefs | No | No | Yes |

Row-level security (RLS) policies in Supabase enforce these at the database level, not just the UI.

---

## Branding

- **Department name:** Cooking Connections
- **Logo:** Placeholder in the header — upload final asset to `/public/logo.png` or swap the `<img src>` in the shared `Header` component
- The header and footer are shared across all pages via the root layout

---

## OpenAI Vision Prompt (extraction target)

When a recipe card image is submitted, the API call asks for a JSON response with this shape:

```json
{
  "title": "",
  "description": "",
  "servings": "",
  "prep_time": "",
  "cook_time": "",
  "ingredients": [
    { "item": "", "quantity": "", "unit": "" }
  ],
  "instructions": "",
  "tags": []
}
```

The raw response is stored in `raw_ocr_data` on the recipe row for debugging and re-processing if needed.

---

## Supabase Storage

- Bucket name: `recipe-cards`
- Access: public read (so image URLs work without auth for customers)
- Upload path: `{storeId}/{recipeId}/{filename}`
- Max file size: 10MB (configurable in Supabase dashboard)

---

## Build Phases

### Phase 1 — Foundation
- [ ] Supabase project: create tables, RLS policies, storage bucket
- [ ] Environment variables wired up (`.env.local`)
- [ ] Install dependencies: `@supabase/supabase-js`, `openai`
- [ ] Shared layout: header (logo placeholder + "Cooking Connections"), footer
- [ ] Store-scoped routing (`/[storeId]`)

### Phase 2 — Customer Pages
- [ ] `/[storeId]` — featured recipes section + search/filter UI
- [ ] `/[storeId]/recipe/[id]` — recipe detail with save photo button
- [ ] Date range filter on recipe archive
- [ ] Search by title, ingredient, or tag

### Phase 3 — Chef Auth & Dashboard
- [ ] `/login` and session handling
- [ ] `/change-password` — forced on first login, guarded in middleware
- [ ] `/dashboard` — chef home
- [ ] `/dashboard/upload` — image upload → Vision OCR → editable form → save
- [ ] `/dashboard/recipes` — list and edit own recipes

### Phase 4 — Admin
- [ ] Admin role guard (middleware or layout check)
- [ ] `/admin/recipes` — all recipes, featured toggle + end date picker
- [ ] `/admin/users` — view accounts, promote to admin, invite form (name/email/store/temp password)

### Phase 5 — Polish
- [ ] Mobile-first responsive design review
- [ ] Logo swap from placeholder to final asset
- [ ] Error states, loading skeletons
- [ ] Image optimization (Next.js `<Image>`)
- [ ] Accessibility pass

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

> `SUPABASE_SERVICE_ROLE_KEY` is used server-side only (API routes/Server Actions) for admin operations that bypass RLS. Never expose it to the client.
