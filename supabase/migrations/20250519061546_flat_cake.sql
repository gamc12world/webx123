/*
  # Create admin user

  1. Changes
    - Insert admin user into public.users table
    - Set is_admin flag to true for admin user

  2. Security
    - Uses existing RLS policies
    - Admin user will have full access due to is_admin flag
*/

-- Insert admin user into public.users table if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM public.users WHERE email = 'admin@stylish.com'
  ) THEN
    INSERT INTO public.users (id, email, name, is_admin)
    SELECT 
      id,
      email,
      'Admin',
      true
    FROM auth.users
    WHERE email = 'admin@stylish.com';
  END IF;
END $$;