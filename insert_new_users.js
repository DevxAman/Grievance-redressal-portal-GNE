import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://dypvelqdjyfbbslqpjxn.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5cHZlbHFkanlmYmJzbHFwanhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTIzMDAwMCwiZXhwIjoyMDYwODA2MDAwfQ.pWRG8sEn6YF2troZ7BYWyPDFwYcJFKm8MptUho5zE8Q';
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Array of all user records to create or update
const users = [
  // Student entries
  { id: 124, user_id: 'amit_k12', email: 'amitkumar1234@gndec.ac.in', name: 'Amit Kumar', role: 'student', phone_number: '9876543124', created_at: '2025-04-23 11:00:00', password: '$2b$10$studentPassword123' },
  { id: 125, user_id: 'neha_s7', email: 'nehasharma1234@gndec.ac.in', name: 'Neha Sharma', role: 'student', phone_number: '9876543125', created_at: '2025-04-23 11:01:00', password: '$2b$10$studentPassword123' },
  { id: 127, user_id: 'priya_j5', email: 'priyajain1234@gndec.ac.in', name: 'Priya Jain', role: 'student', phone_number: '9876543127', created_at: '2025-04-23 11:03:00', password: '$2b$10$studentPassword123' },
  { id: 128, user_id: 'ravi_p3', email: 'ravipandey1234@gndec.ac.in', name: 'Ravi Pandey', role: 'student', phone_number: '9876543128', created_at: '2025-04-23 11:04:00', password: '$2b$10$studentPassword123' },
  { id: 130, user_id: 'rajesh_t4', email: 'rajeshtiwari1234@gndec.ac.in', name: 'Rajesh Tiwari', role: 'student', phone_number: '9876543130', created_at: '2025-04-23 11:06:00', password: '$2b$10$studentPassword123' },
  { id: 132, user_id: 'suresh_k2', email: 'sureshkumar1234@gndec.ac.in', name: 'Suresh Kumar', role: 'student', phone_number: '9876543132', created_at: '2025-04-23 11:08:00', password: '$2b$10$studentPassword123' },
  { id: 134, user_id: 'deepak_b7', email: 'deepakbhatia1234@gndec.ac.in', name: 'Deepak Bhatia', role: 'student', phone_number: '9876543134', created_at: '2025-04-23 11:10:00', password: '$2b$10$studentPassword123' },
  { id: 135, user_id: 'kavita_h3', email: 'kavitahooda1234@gndec.ac.in', name: 'Kavita Hooda', role: 'student', phone_number: '9876543135', created_at: '2025-04-23 11:11:00', password: '$2b$10$studentPassword123' },
  { id: 137, user_id: 'lata_p8', email: 'latapatel1234@gndec.ac.in', name: 'Lata Patel', role: 'student', phone_number: '9876543137', created_at: '2025-04-23 11:13:00', password: '$2b$10$studentPassword123' },
  { id: 139, user_id: 'poonam_j1', email: 'poonamjha1234@gndec.ac.in', name: 'Poonam Jha', role: 'student', phone_number: '9876543139', created_at: '2025-04-23 11:15:00', password: '$2b$10$studentPassword123' },
  { id: 140, user_id: 'rahul_n4', email: 'rahulnagar1234@gndec.ac.in', name: 'Rahul Nagar', role: 'student', phone_number: '9876543140', created_at: '2025-04-23 11:16:00', password: '$2b$10$studentPassword123' },
  { id: 142, user_id: 'gopal_t2', email: 'gopalthakur1234@gndec.ac.in', name: 'Gopal Thakur', role: 'student', phone_number: '9876543142', created_at: '2025-04-23 11:18:00', password: '$2b$10$studentPassword123' },
  { id: 144, user_id: 'rakesh_d3', email: 'rakeshdas1234@gndec.ac.in', name: 'Rakesh Das', role: 'student', phone_number: '9876543144', created_at: '2025-04-23 11:20:00', password: '$2b$10$studentPassword123' },
  { id: 146, user_id: 'mohan_s8', email: 'mohansharma1234@gndec.ac.in', name: 'Mohan Sharma', role: 'student', phone_number: '9876543146', created_at: '2025-04-23 11:22:00', password: '$2b$10$studentPassword123' },
  { id: 147, user_id: 'ritu_g4', email: 'ritugupta1234@gndec.ac.in', name: 'Ritu Gupta', role: 'student', phone_number: '9876543147', created_at: '2025-04-23 11:23:00', password: '$2b$10$studentPassword123' },
  { id: 149, user_id: 'nisha_r1', email: 'nisharai1234@gndec.ac.in', name: 'Nisha Rai', role: 'student', phone_number: '9876543149', created_at: '2025-04-23 11:25:00', password: '$2b$10$studentPassword123' },
  { id: 151, user_id: 'jyoti_m2', email: 'jyotimishra1234@gndec.ac.in', name: 'Jyoti Mishra', role: 'student', phone_number: '9876543151', created_at: '2025-04-23 11:27:00', password: '$2b$10$studentPassword123' },
  { id: 153, user_id: 'shweta_p3', email: 'shwetapandey1234@gndec.ac.in', name: 'Shweta Pandey', role: 'student', phone_number: '9876543153', created_at: '2025-04-23 11:29:00', password: '$2b$10$studentPassword123' },
  { id: 155, user_id: 'neelam_j8', email: 'neelamjain1234@gndec.ac.in', name: 'Neelam Jain', role: 'student', phone_number: '9876543155', created_at: '2025-04-23 11:31:00', password: '$2b$10$studentPassword123' },
  { id: 156, user_id: 'ajay_d4', email: 'ajaydas1234@gndec.ac.in', name: 'Ajay Das', role: 'student', phone_number: '9876543156', created_at: '2025-04-23 11:32:00', password: '$2b$10$studentPassword123' },
  { id: 158, user_id: 'sumit_t1', email: 'sumittiwari1234@gndec.ac.in', name: 'Sumit Tiwari', role: 'student', phone_number: '9876543158', created_at: '2025-04-23 11:34:00', password: '$2b$10$studentPassword123' },
  { id: 160, user_id: 'ravi_g2', email: 'ravigupta1234@gndec.ac.in', name: 'Ravi Gupta', role: 'student', phone_number: '9876543160', created_at: '2025-04-23 11:36:00', password: '$2b$10$studentPassword123' },
  { id: 162, user_id: 'arjun_s3', email: 'arjunsingh1234@gndec.ac.in', name: 'Arjun Singh', role: 'student', phone_number: '9876543162', created_at: '2025-04-23 11:38:00', password: '$2b$10$studentPassword123' },
  { id: 163, user_id: 'lata_m5', email: 'latamishra1234@gndec.ac.in', name: 'Lata Mishra', role: 'student', phone_number: '9876543163', created_at: '2025-04-23 11:39:00', password: '$2b$10$studentPassword123' },
  { id: 165, user_id: 'sonia_d4', email: 'soniadas1234@gndec.ac.in', name: 'Sonia Das', role: 'student', phone_number: '9876543165', created_at: '2025-04-23 11:41:00', password: '$2b$10$studentPassword123' },
  { id: 167, user_id: 'anita_j1', email: 'anitajain1234@gndec.ac.in', name: 'Anita Jain', role: 'student', phone_number: '9876543167', created_at: '2025-04-23 11:43:00', password: '$2b$10$studentPassword123' },

  // Clerk entries
  { id: 126, user_id: 'vikas_g9', email: 'vikasgupta1234@gndec.ac.in', name: 'Vikas Gupta', role: 'clerk', phone_number: '9876543126', created_at: '2025-04-23 11:02:00', password: '$2b$10$clerkPassword456' },
  { id: 133, user_id: 'meena_d9', email: 'meenadas1234@gndec.ac.in', name: 'Meena Das', role: 'clerk', phone_number: '9876543133', created_at: '2025-04-23 11:09:00', password: '$2b$10$clerkPassword456' },
  { id: 138, user_id: 'vikram_s6', email: 'vikramsingh1234@gndec.ac.in', name: 'Vikram Singh', role: 'clerk', phone_number: '9876543138', created_at: '2025-04-23 11:14:00', password: '$2b$10$clerkPassword456' },
  { id: 143, user_id: 'sunita_m7', email: 'sunitamodi1234@gndec.ac.in', name: 'Sunita Modi', role: 'clerk', phone_number: '9876543143', created_at: '2025-04-23 11:19:00', password: '$2b$10$clerkPassword456' },
  { id: 148, user_id: 'sanjay_b6', email: 'sanjaybhat1234@gndec.ac.in', name: 'Sanjay Bhat', role: 'clerk', phone_number: '9876543148', created_at: '2025-04-23 11:24:00', password: '$2b$10$clerkPassword456' },
  { id: 154, user_id: 'rohit_s5', email: 'rohitsingh1234@gndec.ac.in', name: 'Rohit Singh', role: 'clerk', phone_number: '9876543154', created_at: '2025-04-23 11:30:00', password: '$2b$10$clerkPassword456' },
  { id: 159, user_id: 'poonam_k9', email: 'poonamkapoor1234@gndec.ac.in', name: 'Poonam Kapoor', role: 'clerk', phone_number: '9876543159', created_at: '2025-04-23 11:35:00', password: '$2b$10$clerkPassword456' },
  { id: 164, user_id: 'vikram_k8', email: 'vikramkumar1234@gndec.ac.in', name: 'Vikram Kumar', role: 'clerk', phone_number: '9876543164', created_at: '2025-04-23 11:40:00', password: '$2b$10$clerkPassword456' },

  // DSW entries
  { id: 129, user_id: 'sonia_r8', email: 'soniarao1234@gndec.ac.in', name: 'Sonia Rao', role: 'dsw', phone_number: '9876543129', created_at: '2025-04-23 11:05:00', password: '$2b$10$dswPassword789' },
  { id: 136, user_id: 'arun_l5', email: 'arunlal1234@gndec.ac.in', name: 'Arun Lal', role: 'dsw', phone_number: '9876543136', created_at: '2025-04-23 11:12:00', password: '$2b$10$dswPassword789' },
  { id: 145, user_id: 'anju_p5', email: 'anjupatel1234@gndec.ac.in', name: 'Anju Patel', role: 'dsw', phone_number: '9876543145', created_at: '2025-04-23 11:21:00', password: '$2b$10$dswPassword789' },
  { id: 152, user_id: 'anil_k7', email: 'anilkumar1234@gndec.ac.in', name: 'Anil Kumar', role: 'dsw', phone_number: '9876543152', created_at: '2025-04-23 11:28:00', password: '$2b$10$dswPassword789' },
  { id: 161, user_id: 'megha_p7', email: 'meghapandey1234@gndec.ac.in', name: 'Megha Pandey', role: 'dsw', phone_number: '9876543161', created_at: '2025-04-23 11:37:00', password: '$2b$10$dswPassword789' },
  { id: 168, user_id: 'suresh_p9', email: 'sureshpandey1234@gndec.ac.in', name: 'Suresh Pandey', role: 'dsw', phone_number: '9876543168', created_at: '2025-04-23 11:44:00', password: '$2b$10$dswPassword789' },

  // Admin entries
  { id: 131, user_id: 'anita_m6', email: 'anitamishra1234@gndec.ac.in', name: 'Anita Mishra', role: 'admin', phone_number: '9876543131', created_at: '2025-04-23 11:07:00', password: '$2b$10$adminPassword000' },
  { id: 141, user_id: 'seema_k9', email: 'seemakapoor1234@gndec.ac.in', name: 'Seema Kapoor', role: 'admin', phone_number: '9876543141', created_at: '2025-04-23 11:17:00', password: '$2b$10$adminPassword000' },
  { id: 150, user_id: 'vikas_t9', email: 'vikastiwari1234@gndec.ac.in', name: 'Vikas Tiwari', role: 'admin', phone_number: '9876543150', created_at: '2025-04-23 11:26:00', password: '$2b$10$adminPassword000' },
  { id: 157, user_id: 'kajal_r6', email: 'kajalrao1234@gndec.ac.in', name: 'Kajal Rao', role: 'admin', phone_number: '9876543157', created_at: '2025-04-23 11:33:00', password: '$2b$10$adminPassword000' },
  { id: 166, user_id: 'rahul_t6', email: 'rahultiwari1234@gndec.ac.in', name: 'Rahul Tiwari', role: 'admin', phone_number: '9876543166', created_at: '2025-04-23 11:42:00', password: '$2b$10$adminPassword000' }
];

// Function to process users
async function processUsers() {
  try {
    console.log('Connecting to Supabase database...');
    
    // Check which users already exist
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .gte('id', 124)
      .lte('id', 168);
    
    if (checkError) {
      console.error('Error checking existing users:', checkError);
      return;
    }
    
    // Extract existing IDs for easy lookup
    const existingIds = existingUsers ? existingUsers.map(user => user.id) : [];
    console.log(`Found ${existingIds.length} existing users with IDs in our range.`);
    
    // Filter users that don't exist yet
    const usersToCreate = users.filter(user => !existingIds.includes(user.id));
    console.log(`Will insert ${usersToCreate.length} new users.`);
    
    // Filter users that already exist and need updating
    const usersToUpdate = users.filter(user => existingIds.includes(user.id));
    console.log(`Will update ${usersToUpdate.length} existing users.`);
    
    // Insert new users if any
    if (usersToCreate.length > 0) {
      const { data: insertedData, error: insertError } = await supabase
        .from('users')
        .insert(usersToCreate)
        .select();
      
      if (insertError) {
        console.error('Error inserting new users:', insertError);
      } else {
        console.log(`Successfully inserted ${insertedData.length} new users.`);
      }
    }
    
    // Update existing users one by one to avoid conflicts
    for (const user of usersToUpdate) {
      const { id, ...updateData } = user;
      const { data: updatedData, error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select();
      
      if (updateError) {
        console.error(`Error updating user ${id}:`, updateError);
      }
    }
    
    console.log('User updates complete.');
    
    // Verify final state
    const { data: finalUsers, error: finalError } = await supabase
      .from('users')
      .select('id, user_id, email, name, role, phone_number, created_at')
      .gte('id', 124)
      .lte('id', 168)
      .order('id');
    
    if (finalError) {
      console.error('Error verifying final user state:', finalError);
      return;
    }
    
    console.log('Final user state:');
    console.table(finalUsers);
    console.log('Process completed successfully!');
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the function
processUsers(); 