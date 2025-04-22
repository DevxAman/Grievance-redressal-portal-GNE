import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://dypvelqdjyfbbslqpjxn.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5cHZlbHFkanlmYmJzbHFwanhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTIzMDAwMCwiZXhwIjoyMDYwODA2MDAwfQ.pWRG8sEn6YF2troZ7BYWyPDFwYcJFKm8MptUho5zE8Q';
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('users').select('id').limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Successfully connected to Supabase!');
    console.log('Data received:', data);
    return true;
  } catch (err) {
    console.error('❌ Error testing connection:', err.message);
    return false;
  }
}

// Run the test
testConnection()
  .then(result => {
    if (!result) {
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  }); 
// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Store pending registrations temporarily
const pendingRegistrations = new Map();

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login request received');
    
    const { user_id, password } = req.body;
    
    if (!user_id || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and password are required' 
      });
    }
    
    // Find the user in the users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', user_id) // Check user_id in the database
      .single(); // Get a single result
    
    if (userError) {
      console.error('Database error during login:', userError);
      return res.status(500).json({ 
        success: false, 
        message: 'Database error. Please try again later.' 
      });
    }
    
    if (!userData) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid user ID or password.' 
      });
    }
    
    // If password field doesn't exist or is empty in the database
    if (!userData.password) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account setup incomplete. Please contact support.' 
      });
    }
    
    // Verify the password
    // const passwordMatch = await bcrypt.compare(password, userData.password);
    const passwordMatch=userData.password
    
    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid user ID or password.' 
      });
    }
    
    // Remove password from returned user
    const { password: _, ...userWithoutPassword } = userData;
    
    // Determine redirect path based on user role
    let redirectPath = '/dashboard';
    if (userData.role === 'admin') {
      redirectPath = '/admin/dashboard';
    } else if (userData.role === 'clerk') {
      redirectPath = '/clerk/dashboard';
    } else if (userData.role === 'dsw') {
      redirectPath = '/dsw/dashboard';
    }
    
    res.json({ 
      success: true, 
      user: userWithoutPassword, 
      redirectPath 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'An unknown error occurred' 
    });
  }
});


// Signup endpoint
app.post('/api/auth/signup', async (req, res) => {
  try {
    console.log('Signup request received');
    
    const { user_id, email, password } = req.body;
    console.log('Signup data:', { user_id, email, password: '********' });
    
    if (!user_id || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID, email, and password are required' 
      });
    }
    
    // Validate email format
    if (!email.endsWith('@gndec.ac.in')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email must be a valid GNDEC email address (@gndec.ac.in)' 
      });
    }
    
    try {
      // Check if user_id already exists
      const { data: existingUserId, error: userIdError } = await supabase
        .from('users')
        .select('user_id')
        .eq('user_id', user_id)
        .single();
      
      if (userIdError && userIdError.code !== 'PGRST116') {
        console.error('Error checking existing user_id:', userIdError);
        return res.status(500).json({ 
          success: false, 
          message: 'Database error when checking user ID. Please try again.' 
        });
      }
      
      if (existingUserId) {
        return res.status(400).json({ 
          success: false, 
          message: 'User ID already exists. Please choose a different one.' 
        });
      }
      
      // Check if email already exists
      const { data: existingEmail, error: emailError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();
      
      if (emailError && emailError.code !== 'PGRST116') {
        console.error('Error checking existing email:', emailError);
        return res.status(500).json({ 
          success: false, 
          message: 'Database error when checking email. Please try again.' 
        });
      }
      
      if (existingEmail) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already registered. Please use a different email or login.' 
        });
      }
    } catch (dbError) {
      console.error('Database query error:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Error checking user information. Please try again.'
      });
    }
    
    // Hash the password
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);
    const hashedPassword=password;
    
    // Generate OTP for email verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store pending registration
    pendingRegistrations.set(email, {
      user_id,
      email,
      hashedPassword,
      role: 'student', // Default role for new users
      otp,
      created_at: Date.now()
    });
    
    // Set expiration for pending registration (30 minutes)
    setTimeout(() => {
      pendingRegistrations.delete(email);
    }, 30 * 60 * 1000);
    
    // Log OTP for development purposes (remove in production)
    console.log(`Dev only - OTP for ${email}: ${otp}`);
    
    res.json({ 
      success: true, 
      message: 'Verification code sent to your email. Please verify to complete registration.' 
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'An unknown error occurred during signup. Please try again.' 
    });
  }
});

// Email verification endpoint
app.post('/api/auth/verify', async (req, res) => {
  try {
    console.log('Verification request received');
    
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and verification code are required' 
      });
    }
    
    // Check if registration exists
    const pendingReg = pendingRegistrations.get(email);
    if (!pendingReg) {
      return res.status(400).json({ 
        success: false, 
        message: 'No pending registration found or it has expired' 
      });
    }
    
    // Verify OTP
    if (otp !== pendingReg.otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid verification code. Please try again.' 
      });
    }
    
    // Insert into users table
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          user_id: pendingReg.user_id,
          email: pendingReg.email,
          password: pendingReg.hashedPassword,
          role: pendingReg.role,
          created_at: new Date().toISOString(),
        }
      ])
      .select();
    
    if (error) {
      console.error('Error creating user:', error);
      return res.status(400).json({ 
        success: false, 
        message: error.message || 'Failed to create user.' 
      });
    }
    
    if (!data || data.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to create user.' 
      });
    }
    
    // Remove password from returned user
    const { password: _, ...userWithoutPassword } = data[0];
    
    // Clean up pending registration
    pendingRegistrations.delete(email);
    
    res.json({ 
      success: true, 
      message: 'Email verified and account created successfully!',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'An unknown error occurred' 
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 