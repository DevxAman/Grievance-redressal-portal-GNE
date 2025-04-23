import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://dypvelqdjyfbbslqpjxn.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5cHZlbHFkanlmYmJzbHFwanhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTIzMDAwMCwiZXhwIjoyMDYwODA2MDAwfQ.pWRG8sEn6YF2troZ7BYWyPDFwYcJFKm8MptUho5zE8Q';
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Define SQL for updating user roles and passwords
const updateSQL = `
-- First, let's update student entries
UPDATE public.users 
SET role = 'student', 
    password = '$2b$10$studentPassword123' 
WHERE id IN (124, 125, 127, 128, 130, 132, 134, 135, 137, 139, 140, 142, 144, 146, 147, 149, 151, 153, 155, 156, 158, 160, 162, 163, 165, 167);

-- Update clerk entries
UPDATE public.users 
SET role = 'clerk', 
    password = '$2b$10$clerkPassword456' 
WHERE id IN (126, 133, 138, 143, 148, 154, 159, 164);

-- Update DSW entries
UPDATE public.users 
SET role = 'dsw', 
    password = '$2b$10$dswPassword789' 
WHERE id IN (129, 136, 145, 152, 161, 168);

-- Update admin entries
UPDATE public.users 
SET role = 'admin', 
    password = '$2b$10$adminPassword000' 
WHERE id IN (131, 141, 150, 157, 166);
`;

// Function to execute SQL
async function executeSQL() {
  try {
    console.log('Connecting to Supabase database...');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('execute_sql', { sql_query: updateSQL });
    
    if (error) {
      console.error('Error executing SQL:', error);
      return;
    }
    
    console.log('SQL executed successfully');
    
    // Verify the updates
    const { data: users, error: selectError } = await supabase
      .from('users')
      .select('id, user_id, email, name, role, created_at')
      .gte('id', 124)
      .lte('id', 168)
      .order('id');
    
    if (selectError) {
      console.error('Error verifying updates:', selectError);
      return;
    }
    
    console.log('Updated users:');
    console.table(users);
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the function
executeSQL(); 