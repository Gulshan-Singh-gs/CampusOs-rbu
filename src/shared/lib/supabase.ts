import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tzuecqaopmnhcbmadeow.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6dWVjcWFvcG1uaGNibWFkZW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExMzQzMDMsImV4cCI6MjEwNjcxMDMwM30.CkB-pR8cf8SyuHy3pCr5rOrX7sxjpAk2dUWSkGMCAI0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

