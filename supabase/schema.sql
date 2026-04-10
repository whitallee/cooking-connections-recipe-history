-- ============================================================
-- Cooking Connections — Recipe History
-- Run this entire file in the Supabase SQL Editor to set up
-- the database schema, RLS policies, and seed data.
-- ============================================================

-- ─── Tables ──────────────────────────────────────────────────

CREATE TABLE stores (
  id   TEXT PRIMARY KEY,         -- corporate store number, e.g. '451'
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE profiles (
  id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name            TEXT NOT NULL,
  email                TEXT NOT NULL DEFAULT '',
  store_id             TEXT NOT NULL REFERENCES stores(id),
  role                 TEXT NOT NULL DEFAULT 'chef' CHECK (role IN ('chef', 'admin')),
  must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE recipes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        TEXT NOT NULL REFERENCES stores(id),
  uploaded_by     UUID NOT NULL REFERENCES profiles(id),
  title           TEXT NOT NULL,
  description     TEXT,
  ingredients     JSONB NOT NULL DEFAULT '[]',
  instructions    TEXT NOT NULL,
  servings        TEXT,
  prep_time       TEXT,
  cook_time       TEXT,
  tags            TEXT[] NOT NULL DEFAULT '{}',
  promo_products  TEXT[] NOT NULL DEFAULT '{}',
  image_url       TEXT,              -- recipe card photo, nullable (manual entry allowed)
  thumbnail_url   TEXT,              -- food photo shown in recipe lists
  raw_ocr_data    JSONB,
  recipe_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  served_dates    DATE[] NOT NULL DEFAULT '{}',
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  featured_end_date DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Auto-update updated_at ────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Row Level Security ────────────────────────────────────────

ALTER TABLE stores   ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes  ENABLE ROW LEVEL SECURITY;

-- stores: public read, no public write
CREATE POLICY "stores_public_read" ON stores
  FOR SELECT USING (true);

-- profiles: users can read and update their own row
CREATE POLICY "profiles_own_read" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_own_update" ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- profiles: insert and admin reads are done via service role key only.
-- All admin-facing queries use createAdminClient() which bypasses RLS.
-- A "profiles_admin_read" policy was intentionally omitted because querying
-- profiles from within a profiles policy causes recursive evaluation errors.
-- no user-facing insert policy needed

-- recipes: anyone can read (customers are unauthenticated)
CREATE POLICY "recipes_public_read" ON recipes
  FOR SELECT USING (true);

-- recipes: chefs can insert recipes for their own store
CREATE POLICY "recipes_chef_insert" ON recipes
  FOR INSERT WITH CHECK (
    auth.uid() = uploaded_by
    AND store_id = (SELECT store_id FROM profiles WHERE id = auth.uid())
  );

-- recipes: chefs can update their own recipes; admins can update any
CREATE POLICY "recipes_chef_or_admin_update" ON recipes
  FOR UPDATE USING (
    uploaded_by = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- recipes: admins can delete any recipe
CREATE POLICY "recipes_admin_delete" ON recipes
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── Seed Data ─────────────────────────────────────────────────

-- Add your store. Change the id and name to match your store.
INSERT INTO stores (id, name) VALUES ('451', 'Store 451');

-- ─── Bootstrap First Admin ─────────────────────────────────────
--
-- After your first user account is created through the app's
-- invite flow (or manually via Supabase Auth dashboard), promote
-- them to admin by running:
--
--   UPDATE profiles SET role = 'admin' WHERE id = '<user-uuid>';
--
-- Get the UUID from the Supabase Auth > Users tab.
