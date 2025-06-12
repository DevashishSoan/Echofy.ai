/*
  # Create transcriptions table and policies

  1. New Tables
    - `transcriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `content` (text)
      - `word_count` (integer)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `transcriptions` table
    - Add policies for authenticated users to:
      - Read their own transcriptions
      - Create new transcriptions
      - Delete their own transcriptions
*/

-- Create transcriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS transcriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  word_count integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE transcriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can read own transcriptions" ON transcriptions;
    DROP POLICY IF EXISTS "Users can create transcriptions" ON transcriptions;
    DROP POLICY IF EXISTS "Users can delete own transcriptions" ON transcriptions;
END $$;

-- Create policies
CREATE POLICY "Users can read own transcriptions"
  ON transcriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create transcriptions"
  ON transcriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transcriptions"
  ON transcriptions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);