/*
  # Fix profile creation with database trigger

  1. Changes
    - Create a function to automatically handle new user profile creation
    - Add trigger to execute function when new user is created in auth.users
    - Remove dependency on client-side profile creation
    - Ensure profile is created server-side with proper auth context

  2. Security
    - Maintains RLS security while ensuring reliable profile creation
    - Profile creation happens in secure database context
    - No timing issues with auth.uid() availability
*/

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, plan)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'free'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies to be more permissive for server-side operations
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON profiles;

-- Create new policy that allows authenticated users to read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create policy for updates (users can update their own profile)
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Note: No INSERT policy needed since profiles are created via trigger
-- The trigger runs with SECURITY DEFINER, bypassing RLS for the insert operation