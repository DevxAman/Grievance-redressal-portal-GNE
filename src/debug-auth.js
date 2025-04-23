/**
 * Debug script for testing direct Supabase authentication
 * Run this with: node src/debug-auth.js
 * First install dependencies: npm install @supabase/supabase-js
 */
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with your project URL and service role key
const supabaseUrl = 'https://dypvelqdjyfbbslqpjxn.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5cHZlbHFkanlmYmJzbHFwanhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTIzMDAwMCwiZXhwIjoyMDYwODA2MDAwfQ.pWRG8sEn6YF2troZ7BYWyPDFwYcJFKm8MptUho5zE8Q';
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// For added users from 124-168, the password pattern is consistent
// The user_id and plain text password list
const USER_PASSWORDS = {
  // Original users
  '00000000-0000-0000-0000-000000000001': '123456', // admin
  '00000000-0000-0000-0000-000000000002': '123456', // dsw
  '00000000-0000-0000-0000-000000000003': '123456', // clerk
  '00000000-0000-0000-0000-000000000004': '123456', // student
  '123': '123456', // student

  // For users with hashed passwords (simplified for testing)
  'amit_k12': '123456',
  'neha_s7': '123456',
  'vikas_g9': '123456',
  'priya_j5': '123456',
  'ravi_p3': '123456',
  'sonia_r8': '123456',
  'rajesh_t4': '123456',
  'anita_m6': '123456',
  'suresh_k2': '123456',
  'meena_d9': '123456'
  // Add more as needed
};

// Add new debug function to test the login process for a specific user
async function testSpecificUserLogin(userId) {
  try {
    console.log(`\n=== TESTING LOGIN FOR USER: ${userId} ===`);
    
    // Query the user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (userError) {
      console.error(`Error querying user ${userId}:`, userError);
      console.log('Error details:', userError.message);
      
      // Try to find by exact case-sensitive match
      console.log('\nTrying alternative query methods:');
      
      // Get all users
      const { data: allUsers } = await supabase
        .from('users')
        .select('user_id');
        
      console.log('Available user_ids in database:', allUsers.map(u => u.user_id));
      
      // Try case-insensitive search
      const { data: fuzzyMatches } = await supabase
        .from('users')
        .select('*')
        .ilike('user_id', `%${userId}%`);
        
      if (fuzzyMatches && fuzzyMatches.length > 0) {
        console.log(`Found ${fuzzyMatches.length} similar user_ids:`);
        fuzzyMatches.forEach(u => console.log(`- ${u.user_id}`));
      }
      
      return;
    }
    
    if (!userData) {
      console.error('User not found');
      return;
    }
    
    console.log('User found in database:', {
      user_id: userData.user_id,
      email: userData.email,
      role: userData.role,
      name: userData.name,
      // Show password format but not the actual password for security
      password_format: userData.password ? 
        (userData.password.startsWith('$2b$') ? 'HASHED' : 'PLAIN') : 'NONE'
    });
    
    // Check columns and data types
    console.log('\nDatabase column names and types:');
    const columns = Object.keys(userData);
    columns.forEach(colName => {
      const value = userData[colName];
      console.log(`- ${colName}: ${value === null ? 'NULL' : typeof value}${value === null ? '' : ` (${value.toString().substring(0, 30)}${value.toString().length > 30 ? '...' : ''})`}`);
    });
    
    // Simulate login password check
    const expectedPassword = USER_PASSWORDS[userId] || '123456';
    console.log(`\nSimulating login check: user_id: ${userId}, password: ${expectedPassword}`);
    
    // Check exact match (without bcrypt)
    const directMatch = userData.password === expectedPassword;
    console.log(`- Direct password match: ${directMatch}`);
    
    if (userData.password && userData.password.startsWith('$2b$')) {
      console.log('- This password is hashed and needs bcrypt.compare() to verify');
      console.log('- Check that bcrypt is properly installed: npm list bcryptjs');
    }
    
    // Login simulation results
    console.log('\nLogin simulation result:');
    if (directMatch) {
      console.log('✅ LOGIN WOULD SUCCEED with plain password comparison');
    } else if (userData.password && userData.password.startsWith('$2b$')) {
      console.log('⚠️ LOGIN REQUIRES bcrypt.compare() verification');
      console.log('↳ Make sure you have the correct password and bcrypt is working properly');
    } else {
      console.log('❌ LOGIN WOULD FAIL with the credentials provided');
    }
    
    // Suggestions
    console.log('\nSuggested fixes:');
    if (userData.password && userData.password.startsWith('$2b$')) {
      console.log('1. Update user password to plain text in database (for testing)');
      console.log(`2. Run this SQL: UPDATE users SET password = '${expectedPassword}' WHERE user_id = '${userId}';`);
      console.log('3. Make sure bcrypt is installed: npm install bcryptjs');
      console.log('4. Check AuthContext implementation for proper password comparison');
    } else if (!directMatch) {
      console.log(`1. Update password to '${expectedPassword}' in database`);
    } else {
      console.log('No fixes needed - direct password comparison should work');
    }
    
  } catch (error) {
    console.error('Error testing user login:', error);
  }
}

async function listUserLoginInfo() {
  console.log('Generating login information for users...');
  
  try {
    // Get all users
    const { data: allUsers, error: listError } = await supabase
      .from('users')
      .select('*')
      .order('role');
      
    if (listError) {
      console.error('Error listing users:', listError);
      return;
    } 
    
    if (allUsers && allUsers.length > 0) {
      console.log(`\nFound ${allUsers.length} users in total`);
      
      // Group users by role
      const usersByRole = {};
      
      allUsers.forEach(user => {
        const role = user.role || 'unknown';
        if (!usersByRole[role]) {
          usersByRole[role] = [];
        }
        usersByRole[role].push(user);
      });
      
      // Print login info by role
      console.log('\n=== LOGIN INFORMATION BY ROLE ===');
      console.log('Use these credentials for testing:');
      
      for (const role in usersByRole) {
        console.log(`\n** ${role.toUpperCase()} USERS (${usersByRole[role].length}) **`);
        
        usersByRole[role].forEach(user => {
          // Get the suggested plain password for this user
          const suggestedPass = USER_PASSWORDS[user.user_id] || '123456';
          
          // Password hint
          let passwordHint = '';
          if (user.password && user.password.startsWith('$2b$')) {
            passwordHint = ' (Use plain text password: ' + suggestedPass + ')';
          }
          
          console.log(`- User ID: ${user.user_id}${passwordHint}`);
        });
      }
      
      console.log('\n=== IMPORTANT NOTES ===');
      console.log('1. For hashed passwords (starting with $2b$), use the suggested plain text password');
      console.log('2. The AuthContext has been updated to support both hashed and plain text passwords');
      console.log('3. Test a login with the User ID and suggested password');
    } else {
      console.log('No users found in the database.');
    }
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}

// Check if a specific user ID was provided as an argument
const args = process.argv.slice(2);
if (args.length > 0 && args[0]) {
  // Test specific user login
  testSpecificUserLogin(args[0]);
} else {
  // Run the general login info function
  listUserLoginInfo();
} 