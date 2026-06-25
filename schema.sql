-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Sidebar Groups Table
CREATE TABLE sidebar_groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create Categories Table
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id UUID REFERENCES sidebar_groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  section_title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create Resources Table
CREATE TABLE resources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  url TEXT,
  ppt_url TEXT,
  doc_url TEXT,
  badges TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  popup_details JSONB,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE sidebar_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read-access on sidebar_groups" ON sidebar_groups FOR SELECT USING (true);
CREATE POLICY "Allow public read-access on categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read-access on resources" ON resources FOR SELECT USING (true);

-- Allow write access only for specific admin email (aliaswave7@gmail.com)
CREATE POLICY "Allow admin write-access on sidebar_groups" ON sidebar_groups FOR ALL USING (auth.jwt() ->> 'email' = 'aliaswave7@gmail.com');
CREATE POLICY "Allow admin write-access on categories" ON categories FOR ALL USING (auth.jwt() ->> 'email' = 'aliaswave7@gmail.com');
CREATE POLICY "Allow admin write-access on resources" ON resources FOR ALL USING (auth.jwt() ->> 'email' = 'aliaswave7@gmail.com');
