import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Add fallback values for development or when environment variables are missing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

console.log('Supabase URL:', supabaseUrl);
console.log('Using environment variables:', !!import.meta.env.VITE_SUPABASE_URL);

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
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