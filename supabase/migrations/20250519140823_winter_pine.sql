/*
  # Fix OTP Verification Policies

  1. Changes
    - Remove existing INSERT policy that requires authentication
    - Add new INSERT policy that allows public access for OTP creation
    - Keep existing SELECT and UPDATE policies unchanged

  2. Security
    - Allows public users to create OTP verifications (necessary for login)
    - Maintains secure access for viewing and updating OTP records
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can insert OTP verifications" ON public.otp_verifications;

-- Create new INSERT policy that allows public access
CREATE POLICY "Allow public OTP creation" ON public.otp_verifications
FOR INSERT TO public
WITH CHECK (true);

-- Note: Existing SELECT and UPDATE policies remain unchanged as they correctly
-- handle authenticated access for verifying and updating OTP records