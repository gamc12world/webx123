-- Create admin user in auth.users if not exists
DO $$
DECLARE
  admin_uid uuid;
BEGIN
  -- Check if admin user exists in auth.users
  SELECT id INTO admin_uid
  FROM auth.users
  WHERE email = 'admin@stylish.com';

  -- If admin doesn't exist, create it
  IF admin_uid IS NULL THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@stylish.com',
      crypt('Admin123!@#', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Admin"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO admin_uid;

    -- Insert into public.users table
    INSERT INTO public.users (id, email, name, is_admin)
    VALUES (admin_uid, 'admin@stylish.com', 'Admin', true);
  END IF;
END $$;

-- Ensure admin user has is_admin set to true
UPDATE public.users
SET is_admin = true
WHERE email = 'admin@stylish.com';