export { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';

import { supabase as supabaseClient } from '@/integrations/supabase/client';

export const requireSupabase = () => {
  if (!supabaseClient) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }
  return supabaseClient;
};
