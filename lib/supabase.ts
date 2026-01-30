import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface PostureClient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
}

export interface PostureSession {
  id: string;
  client_id: string;
  created_at: string;
  status: 'in_progress' | 'analyzed' | 'completed';
}

export interface PosturePhoto {
  id: string;
  session_id: string;
  photo_type: 'front' | 'back' | 'left' | 'right';
  original_url: string;
  analyzed_url: string | null;
  analysis_json: any | null;
  created_at: string;
}

export interface PostureReport {
  id: string;
  session_id: string;
  summary: string;
  recommendations: string[];
  full_report_json: any;
  created_at: string;
}
