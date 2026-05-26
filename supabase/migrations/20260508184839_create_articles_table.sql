/*
  # Create articles table

  1. New Tables
    - `articles`
      - `id` (bigint, primary key, auto-increment)
      - `title` (text, not null)
      - `business` (text, not null)
      - `keyword` (text, not null)
      - `document_link` (text, default empty string)
      - `content` (text, default empty string)
      - `status` (text, default 'new', one of: 'new', 'processing', 'completed')
      - `tags` (text array, default empty array)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `articles` table
    - Add policy for authenticated users to perform all operations
    - Add policy for anonymous users to read all articles (public read for dashboard)

  3. Indexes
    - Index on `status` for filtering
    - Index on `keyword` for search
    - Index on `business` for search
*/

CREATE TABLE IF NOT EXISTS articles (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title text NOT NULL,
  business text NOT NULL,
  keyword text NOT NULL,
  document_link text DEFAULT '',
  content text DEFAULT '',
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'processing', 'completed')),
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_keyword ON articles(keyword);
CREATE INDEX IF NOT EXISTS idx_articles_business ON articles(business);

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Public read access (dashboard needs to display articles without login)
CREATE POLICY "Anyone can read articles"
  ON articles FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can insert articles
CREATE POLICY "Authenticated users can insert articles"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update articles
CREATE POLICY "Authenticated users can update articles"
  ON articles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users can delete articles
CREATE POLICY "Authenticated users can delete articles"
  ON articles FOR DELETE
  TO authenticated
  USING (true);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON articles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
