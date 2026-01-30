-- Create posture_clients table
CREATE TABLE IF NOT EXISTS posture_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posture_sessions table
CREATE TABLE IF NOT EXISTS posture_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES posture_clients(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'analyzed', 'completed'))
);

-- Create posture_photos table
CREATE TABLE IF NOT EXISTS posture_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES posture_sessions(id) ON DELETE CASCADE,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('front', 'back', 'left', 'right')),
  original_url TEXT NOT NULL,
  analyzed_url TEXT,
  analysis_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posture_reports table
CREATE TABLE IF NOT EXISTS posture_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES posture_sessions(id) ON DELETE CASCADE,
  summary TEXT,
  recommendations TEXT[],
  full_report_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_posture_sessions_client_id ON posture_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_posture_photos_session_id ON posture_photos(session_id);
CREATE INDEX IF NOT EXISTS idx_posture_reports_session_id ON posture_reports(session_id);

-- Enable Row Level Security (optional - can be disabled for internal apps)
ALTER TABLE posture_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE posture_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE posture_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE posture_reports ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all operations (for internal app use)
CREATE POLICY "Allow all operations" ON posture_clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON posture_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON posture_photos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON posture_reports FOR ALL USING (true) WITH CHECK (true);
