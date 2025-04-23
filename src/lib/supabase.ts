import { createClient } from '@supabase/supabase-js';

// Supabase configuration with hardcoded fallback values that we know work
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dypvelqdjyfbbslqpjxn.supabase.co';
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5cHZlbHFkanlmYmJzbHFwanhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTIzMDAwMCwiZXhwIjoyMDYwODA2MDAwfQ.pWRG8sEn6YF2troZ7BYWyPDFwYcJFKm8MptUho5zE8Q';

console.log('Supabase URL:', supabaseUrl);
console.log('Using environment variables:', !!import.meta.env.VITE_SUPABASE_URL);

// Initialize the Supabase client with service role key for full access
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage,
    storageKey: 'gndec_supabase_auth',
    detectSessionInUrl: true,
  },
  realtime: {
    // Disable realtime subscriptions to avoid WebSocket connection errors
    enabled: false
  }
});

// Function to test Supabase connection
export const testSupabaseConnection = async () => {
  try {
    // Try to fetch a small amount of data to test the connection
    const { data, error } = await supabase.from('users').select('id').limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error.message);
      return { success: false, message: error.message };
    }
    
    console.log('Supabase connection successful');
    return { success: true, message: 'Connection successful' };
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return { success: false, message: String(error) };
  }
};

export default supabase; 