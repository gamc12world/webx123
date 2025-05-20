/*
  # Add OTP verification table

  1. New Tables
    - `otp_verifications`
      - `id` (uuid, primary key)
      - `email` (text)
      - `otp` (text)
      - `expires_at` (timestamptz)
      - `created_at` (timestamptz)
      - `verified` (boolean)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS otp_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  otp text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  verified boolean DEFAULT false
);

ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own OTP verifications"
  ON otp_verifications
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Users can insert OTP verifications"
  ON otp_verifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own OTP verifications"
  ON otp_verifications
  FOR UPDATE
  TO authenticated
  USING (email = auth.jwt() ->> 'email')
  WITH CHECK (email = auth.jwt() ->> 'email');