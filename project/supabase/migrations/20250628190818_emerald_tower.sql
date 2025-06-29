/*
  # Enhanced user profile management with automatic creation

  1. New Features
    - Automatic profile creation via database trigger
    - Enhanced error handling and logging
    - Proper RLS policies for all operations
    - Support for user metadata extraction

  2. Security
    - Enable RLS on profiles table
    - Comprehensive policies for authenticated users
    - Service role access for trigger operations
    - Proper constraint validation

  3. Changes
    - Drop and recreate trigger function with better error handling
    - Add comprehensive RLS policies
    - Ensure proper indexes and constraints
    - Add updated_at trigger functionality
*/

-- Drop trigger first to avoid dependency errors
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Now safely drop the function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create enhanced function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
BEGIN
  -- Extract name from metadata or use email as fallback
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );

  -- Insert profile with error handling
  BEGIN
    INSERT INTO public.profiles (id, email, name, plan, created_at, updated_at)
    VALUES (
      NEW.id,
      NEW.email,
      user_name,
      'free',
      timezone('utc'::text, now()),
      timezone('utc'::text, now())
    );
    
    -- Log successful profile creation
    RAISE LOG 'Profile created successfully for user: %', NEW.id;
    
  EXCEPTION 
    WHEN unique_violation THEN
      -- Profile already exists, update it instead
      UPDATE public.profiles 
      SET 
        email = NEW.email,
        name = user_name,
        updated_at = timezone('utc'::text, now())
      WHERE id = NEW.id;
      
      RAISE LOG 'Profile updated for existing user: %', NEW.id;
      
    WHEN OTHERS THEN
      -- Log the error but don't fail the user creation
      RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure proper indexes exist
CREATE INDEX IF NOT EXISTS profiles_id_idx ON profiles(id);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_key ON profiles(email);

-- Drop existing RLS policies before recreating them
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable service role access" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Enable read access for own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable update for own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow service role to manage profiles (for the trigger)
CREATE POLICY "Enable service role access"
  ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile during signup"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure the updated_at trigger function exists
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the updated_at trigger
DROP TRIGGER IF EXISTS update_profiles_timestamp ON profiles;
CREATE TRIGGER update_profiles_timestamp
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add constraint to ensure plan values are valid
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_plan_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_plan_check 
CHECK (plan IN ('free', 'pro', 'enterprise'));

-- Ensure all existing profiles have valid plans
UPDATE profiles SET plan = 'free' WHERE plan IS NULL OR plan NOT IN ('free', 'pro', 'enterprise');

-- Ensure the profiles table has the correct structure
DO $$
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'plan'
  ) THEN
    ALTER TABLE profiles ADD COLUMN plan text DEFAULT 'free';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN created_at timestamptz DEFAULT timezone('utc'::text, now());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN updated_at timestamptz DEFAULT timezone('utc'::text, now());
  END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;