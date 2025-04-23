/**
 * Script to update all user passwords to plain text in the database
 * Run with: node src/update-db-passwords.js
 */
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with your project URL and service role key
const supabaseUrl = 'https://dypvelqdjyfbbslqpjxn.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5cHZlbHFkanlmYmJzbHFwanhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTIzMDAwMCwiZXhwIjoyMDYwODA2MDAwfQ.pWRG8sEn6YF2troZ7BYWyPDFwYcJFKm8MptUho5zE8Q';
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Set the plain text password for all users
const PLAIN_PASSWORD = '123456';

async function updateAllPasswords() {
  try {
    console.log('Updating all user passwords to plain text...');
    
    // Get all users with hashed passwords
    const { data: users, error: getUsersError } = await supabase
      .from('users')
      .select('id, user_id, password')
      .like('password', '$2b$%');
      
    if (getUsersError) {
      console.error('Error getting users:', getUsersError);
      return;
    }
    
    console.log(`Found ${users.length} users with hashed passwords`);
    
    // Update each user's password
    for (const user of users) {
      console.log(`Updating password for user ${user.user_id} (ID: ${user.id})...`);
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ password: PLAIN_PASSWORD })
        .eq('id', user.id);
        
      if (updateError) {
        console.error(`Error updating password for user ${user.user_id}:`, updateError);
      } else {
        console.log(`✅ Password updated for user ${user.user_id}`);
      }
    }
    
    console.log('\nPassword update complete!');
    console.log(`All updated users now have the password: ${PLAIN_PASSWORD}`);
    console.log('You should now be able to log in with these credentials.');
    
  } catch (error) {
    console.error('Error updating passwords:', error);
  }
}

// Run the function
updateAllPasswords(); 