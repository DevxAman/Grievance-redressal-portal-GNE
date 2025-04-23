/**
 * Script to update all user roles to 'student'
 * Run with: node src/update-student-roles.js
 */
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with your project URL and service role key
const supabaseUrl = 'https://dypvelqdjyfbbslqpjxn.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5cHZlbHFkanlmYmJzbHFwanhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTIzMDAwMCwiZXhwIjoyMDYwODA2MDAwfQ.pWRG8sEn6YF2troZ7BYWyPDFwYcJFKm8MptUho5zE8Q';
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Exception list - Users that should NOT be changed to student role
// This will preserve specific admin, clerk, and dsw users that are supposed to remain in those roles
const EXCEPTIONS = [
  // Original system users - keep as is
  '00000000-0000-0000-0000-000000000001', // admin
  '00000000-0000-0000-0000-000000000002', // dsw
  '00000000-0000-0000-0000-000000000003', // clerk
  '00000000-0000-0000-0000-000000000004', // student
];

async function updateAllRolesToStudent() {
  try {
    console.log('Updating user roles to student...');
    
    // Get all users in the range of IDs 124-168
    const { data: users, error: getUsersError } = await supabase
      .from('users')
      .select('*')
      .gte('id', 124)
      .lte('id', 168);
      
    if (getUsersError) {
      console.error('Error getting users:', getUsersError);
      return;
    }
    
    console.log(`Found ${users.length} users to process`);
    
    // Update each user's role to student
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const user of users) {
      // Skip users in the exception list
      if (EXCEPTIONS.includes(user.user_id)) {
        console.log(`Skipping ${user.user_id} (ID: ${user.id}) as it's in the exception list`);
        skippedCount++;
        continue;
      }
      
      if (user.role !== 'student') {
        console.log(`Updating role for ${user.user_id} (ID: ${user.id}) from '${user.role}' to 'student'...`);
        
        const { error: updateError } = await supabase
          .from('users')
          .update({ role: 'student' })
          .eq('id', user.id);
          
        if (updateError) {
          console.error(`Error updating role for ${user.user_id}:`, updateError);
        } else {
          console.log(`✅ Role updated for ${user.user_id}`);
          updatedCount++;
        }
      } else {
        console.log(`${user.user_id} (ID: ${user.id}) is already a student, skipping`);
        skippedCount++;
      }
    }
    
    console.log('\nRole update complete!');
    console.log(`Updated ${updatedCount} users to student role`);
    console.log(`Skipped ${skippedCount} users`);
    
  } catch (error) {
    console.error('Error updating roles:', error);
  }
}

// Run the function
updateAllRolesToStudent(); 