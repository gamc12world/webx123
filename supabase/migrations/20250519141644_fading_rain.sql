/*
  # Store Resend API key securely
  
  1. Changes
    - Create a secure storage table for API keys
    - Store the Resend API key with appropriate access controls
    - Enable RLS for security
*/

-- Create API keys table if it doesn't exist
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Only allow admin users to read API keys
CREATE POLICY "Allow admin read access"
  ON api_keys
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Store Resend API key
INSERT INTO api_keys (name, value)
VALUES ('RESEND_API_KEY', 're_UR7UVzgu_Cr5xdXx4dq4DAoLFeV2jNvWn')
ON CONFLICT (name) 
DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();