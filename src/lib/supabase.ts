import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://aivayoleogjvgpkvxmkq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpdmF5b2xlb2dqdmdwa3Z4bWtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjkwNzUsImV4cCI6MjA3MzY0NTA3NX0.vPP3sqVWTxgNNV_Du1qvnE6C9fg1-sa074Ap-yTP-XI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);