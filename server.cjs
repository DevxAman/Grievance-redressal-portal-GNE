const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables

// Log email configuration (with sensitive data redacted)
console.log('Email configuration loaded:', {
  emailUser: process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 3)}...` : 'not set',
  emailPass: process.env.EMAIL_PASS ? '********' : 'not set'
});

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com', // Use environment variable or default
    pass: process.env.EMAIL_PASS || 'your-app-password'    // Use environment variable or default
  }
});

// Email sending function
const sendEmailConfirmation = async (to, subject, grievanceData) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #2c3e50; text-align: center; margin-bottom: 20px;">Grievance Submission Confirmation</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.5;">Dear Student,</p>
          <p style="color: #555; font-size: 16px; line-height: 1.5;">Your grievance has been successfully submitted to the administration. Here are the details:</p>
          
          <div style="background-color: #fff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3498db;">
            <p style="margin: 5px 0;"><strong>Grievance ID:</strong> ${grievanceData.id}</p>
            <p style="margin: 5px 0;"><strong>Title:</strong> ${grievanceData.title}</p>
            <p style="margin: 5px 0;"><strong>Category:</strong> ${grievanceData.category}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> ${grievanceData.status}</p>
            <p style="margin: 5px 0;"><strong>Submitted on:</strong> ${new Date(grievanceData.created_at).toLocaleString()}</p>
          </div>
          
          <p style="color: #555; font-size: 16px; line-height: 1.5;">Your grievance is now under review by our administration team. You will receive updates as there are developments on your case.</p>
          
          <p style="color: #555; font-size: 16px; line-height: 1.5;">Thank you for your patience.</p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #777; font-size: 14px;">This is an automated message. Please do not reply to this email.</p>
            <p style="color: #777; font-size: 14px;">GNDEC Grievance Portal</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Initialize Supabase client
const supabaseUrl = 'https://dypvelqdjyfbbslqpjxn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5cHZlbHFkanlmYmJzbHFwanhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyMzAwMDAsImV4cCI6MjA2MDgwNjAwMH0.Zfd49785DgzmQjw2Hg1gHCdJh81ZHJXazuoxeOvcXlQ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
      .eq('user_id', user_id)
      .single();
    
    if (userError) {
      console.error('Database error during login:', userError);
      return res.status(400).json({ 
        success: false, 
        message: 'User not found. Please check your credentials.' 
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
    const passwordMatch = await bcrypt.compare(password, userData.password);
    
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
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
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

// Add endpoint for sending grievance confirmation emails
app.post('/api/grievances/send-confirmation', async (req, res) => {
  try {
    const { email, grievanceData } = req.body;
    
    if (!email || !grievanceData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and grievance data are required'
      });
    }

    console.log('Sending grievance confirmation email to:', email);
    
    const result = await sendEmailConfirmation(
      email,
      `Grievance Submission Confirmation - ${grievanceData.title}`,
      grievanceData
    );
    
    if (result.success) {
      console.log('Email sent successfully');
      return res.json({ 
        success: true, 
        message: 'Confirmation email sent successfully'
      });
    } else {
      console.error('Failed to send email:', result.error);
      return res.status(500).json({ 
        success: false, 
        message: `Failed to send email: ${result.error}`
      });
    }
  } catch (error) {
    console.error('Grievance confirmation email error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to send confirmation email'
    });
  }
});

// Add endpoint for sending reminder emails
app.post('/api/grievances/send-reminder', async (req, res) => {
  const { grievance, userEmail } = req.body;
  
  if (!grievance || !userEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    console.log(`Sending reminder email for grievance ${grievance.id} requested by ${userEmail}`);
    
    // Get admin email from environment variables or use a default
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    
    // Create email content
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@gndec.ac.in',
      to: adminEmail,
      subject: `REMINDER: Grievance #${grievance.id} Requires Attention`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #d32f2f; text-align: center;">Grievance Reminder</h2>
          <p><strong>A student has requested attention to their grievance:</strong></p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0;">
            <p><strong>Grievance ID:</strong> ${grievance.id}</p>
            <p><strong>Title:</strong> ${grievance.title}</p>
            <p><strong>Category:</strong> ${grievance.category}</p>
            <p><strong>Submitted:</strong> ${new Date(grievance.created_at).toLocaleString()}</p>
            <p><strong>Current Status:</strong> ${grievance.status}</p>
          </div>
          <p>The student with email <strong>${userEmail}</strong> has requested an update on this grievance.</p>
          <p>Please review this grievance at your earliest convenience and provide an update to the student.</p>
          <div style="text-align: center; margin-top: 20px;">
            <a href="${process.env.APP_URL || 'http://localhost:5173'}/admin/dashboard" 
               style="background-color: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
              Review Grievance
            </a>
          </div>
          <p style="margin-top: 30px; font-size: 12px; color: #757575; text-align: center;">
            This is an automated message from the GNDEC Grievance Tracking System.
          </p>
        </div>
      `
    };
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Reminder email sent successfully:', info.messageId);
    
    res.status(200).json({ success: true, message: 'Reminder email sent to admin' });
  } catch (error) {
    console.error('Error sending reminder email:', error);
    res.status(500).json({ error: 'Failed to send reminder email' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 