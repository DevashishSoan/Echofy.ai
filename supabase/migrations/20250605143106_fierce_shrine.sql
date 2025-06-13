/*
  # Enhanced Transcription System

  1. New Tables
    - `folders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. New Columns for Transcriptions
    - `language` (text, default 'en-US')
    - `folder_id` (uuid, references folders)
    - `tags` (text array)
    - `timestamps` (jsonb)
    - `summary` (text)
    - `updated_at` (timestamptz)

  3. Features
    - Automatic timestamp updates
    - Full-text search capabilities
    - Folder organization
    - Language support
    - Tagging system
*/

-- Create folders table first
CREATE TABLE IF NOT EXISTS folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on folders
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can manage own folders" ON folders;

-- Create folder policies
CREATE POLICY "Users can manage own folders"
  ON folders
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Now add new columns to transcriptions
ALTER TABLE transcriptions
ADD COLUMN IF NOT EXISTS language text DEFAULT 'en-US',
ADD COLUMN IF NOT EXISTS folder_id uuid REFERENCES folders(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS timestamps jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS summary text,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_transcriptions_timestamp ON transcriptions;
DROP TRIGGER IF EXISTS update_folders_timestamp ON folders;

-- Create triggers for updated_at
CREATE TRIGGER update_transcriptions_timestamp
  BEFORE UPDATE ON transcriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_folders_timestamp
  BEFORE UPDATE ON folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create index for full-text search
CREATE INDEX IF NOT EXISTS transcriptions_content_search_idx
  ON transcriptions
  USING gin(to_tsvector('english', content));

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS search_transcriptions(text, uuid);

-- Create search function
CREATE OR REPLACE FUNCTION search_transcriptions(search_query text, user_id uuid)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  created_at timestamptz,
  folder_id uuid,
  tags text[],
  rank float4
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.title,
    t.content,
    t.created_at,
    t.folder_id,
    t.tags,
    ts_rank(to_tsvector('english', t.content), plainto_tsquery(search_query)) as rank
  FROM transcriptions t
  WHERE
    t.user_id = user_id
    AND to_tsvector('english', t.content) @@ plainto_tsquery(search_query)
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;