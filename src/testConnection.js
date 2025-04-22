import { testSupabaseConnection } from './lib/supabase';

// Execute the test connection function
async function runTest() {
  console.log('Testing Supabase connection...');
  const result = await testSupabaseConnection();
  
  console.log('Test result:', result);
  
  if (result.success) {
    console.log('✅ Supabase connection is working correctly!');
  } else {
    console.log('❌ Supabase connection failed:', result.message);
  }
}

runTest().catch(err => {
  console.error('Error running test:', err);
}); 