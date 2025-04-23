import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://dypvelqdjyfbbslqpjxn.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5cHZlbHFkanlmYmJzbHFwanhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTIzMDAwMCwiZXhwIjoyMDYwODA2MDAwfQ.pWRG8sEn6YF2troZ7BYWyPDFwYcJFKm8MptUho5zE8Q';
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Define user groups by role
const studentIds = [124, 125, 127, 128, 130, 132, 134, 135, 137, 139, 140, 142, 144, 146, 147, 149, 151, 153, 155, 156, 158, 160, 162, 163, 165, 167];
const clerkIds = [126, 133, 138, 143, 148, 154, 159, 164];
const dswIds = [129, 136, 145, 152, 161, 168];
const adminIds = [131, 141, 150, 157, 166];

// Function to update users
async function updateUsers() {
  try {
    console.log('Connecting to Supabase database...');
    
    // Update student users
    console.log('Updating student users...');
    const { data: studentsData, error: studentsError } = await supabase
      .from('users')
      .update({ 
        role: 'student',
        password: '$2b$10$studentPassword123'
      })
      .in('id', studentIds);
    
    if (studentsError) {
      console.error('Error updating student users:', studentsError);
    } else {
      console.log(`Updated ${studentIds.length} student users.`);
    }
    
    // Update clerk users
    console.log('Updating clerk users...');
    const { data: clerksData, error: clerksError } = await supabase
      .from('users')
      .update({ 
        role: 'clerk',
        password: '$2b$10$clerkPassword456'
      })
      .in('id', clerkIds);
    
    if (clerksError) {
      console.error('Error updating clerk users:', clerksError);
    } else {
      console.log(`Updated ${clerkIds.length} clerk users.`);
    }
    
    // Update DSW users
    console.log('Updating DSW users...');
    const { data: dswData, error: dswError } = await supabase
      .from('users')
      .update({ 
        role: 'dsw',
        password: '$2b$10$dswPassword789'
      })
      .in('id', dswIds);
    
    if (dswError) {
      console.error('Error updating DSW users:', dswError);
    } else {
      console.log(`Updated ${dswIds.length} DSW users.`);
    }
    
    // Update admin users
    console.log('Updating admin users...');
    const { data: adminData, error: adminError } = await supabase
      .from('users')
      .update({ 
        role: 'admin',
        password: '$2b$10$adminPassword000'
      })
      .in('id', adminIds);
    
    if (adminError) {
      console.error('Error updating admin users:', adminError);
    } else {
      console.log(`Updated ${adminIds.length} admin users.`);
    }
    
    // Verify the updates
    console.log('Verifying updates...');
    const { data: users, error: selectError } = await supabase
      .from('users')
      .select('id, user_id, email, name, role, phone_number, created_at')
      .gte('id', 124)
      .lte('id', 168)
      .order('id');
    
    if (selectError) {
      console.error('Error verifying updates:', selectError);
      return;
    }
    
    console.log('Updated users:');
    console.table(users);
    console.log('Update process completed successfully!');
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the function
updateUsers(); 