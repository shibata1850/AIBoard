/*
  # Create company_info table for storing company rules and policies

  1. New Tables
    - `company_info`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `content` (text, required)
      - `category` (text, required)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `company_info` table
    - Add policies for:
      - Admins can create, update, delete
      - All authenticated users can read
*/

CREATE TABLE IF NOT EXISTS company_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL CHECK (category IN ('社訓', 'ポリシー', '手順', 'FAQ')),
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can read company info"
  ON company_info
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can insert company info"
  ON company_info
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update company info"
  ON company_info
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete company info"
  ON company_info
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE OR REPLACE FUNCTION update_company_info_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_info_updated_at
  BEFORE UPDATE ON company_info
  FOR EACH ROW EXECUTE FUNCTION update_company_info_updated_at();
