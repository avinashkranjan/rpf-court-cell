-- Migration: Auto-create profile with database trigger
-- Issue: When email confirmation is enabled, signUp doesn't return a session
-- Solution: Use a database trigger to automatically create profile
-- Date: 2026-02-11

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert a basic profile for the new user
  -- Additional profile data will be updated later when they complete registration
  INSERT INTO public.profiles (id, full_name, designation, post_name, railway_zone, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'designation', 'Pending'),
    COALESCE(NEW.raw_user_meta_data->>'post_name', 'Pending'),
    COALESCE(NEW.raw_user_meta_data->>'railway_zone', 'Pending'),
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$;

-- Trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Note: This trigger will create a basic profile immediately when auth.users is created
-- The application should update the profile with complete data after email verification
