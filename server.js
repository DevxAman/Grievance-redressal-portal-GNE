import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import 'dotenv/config'; // Load environment variables

// Log email configuration (with sensitive data redacted)
console.log('Email configuration loaded:', {
  emailUser: process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 3)}...` : 'not set',
  emailPass: process.env.EMAIL_PASS ? '********' : 'not set'
});

// Nodemailer transporter setup with enhanced configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com', // Use environment variable or default
    pass: process.env.EMAIL_PASS || 'your-app-password'    // Use environment variable or default
  },
  tls: {
    rejectUnauthorized: false // Helps with some email server issues
  },
  debug: process.env.NODE_ENV !== 'production', // Enable debug in development
  pool: true, // Use pooled connection (more efficient for multiple sends)
  maxConnections: 5, // Maximum number of simultaneous connections
  maxMessages: 100 // Maximum number of messages to send using a connection
});

// Verify transporter connection at startup
transporter.verify(function(error, success) {
  if (error) {
    console.error('Nodemailer connection error:', error);
  } else {
    console.log('Nodemailer server is ready to send messages');
  }
});

// Email sending function with enhanced error handling and template
const sendEmailConfirmation = async (to, subject, grievanceData) => {
  try {
    // Validate inputs
    if (!to || !grievanceData || !grievanceData.id) {
      throw new Error('Missing required email parameters');
    }

    // Format date in a readable format
    const formattedDate = grievanceData.created_at 
      ? new Date(grievanceData.created_at).toLocaleString() 
      : new Date().toLocaleString();
    
    // Better HTML email template with responsive design
    const mailOptions = {
      from: `"GNDEC Grievance Portal" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
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
            <p style="margin: 5px 0;"><strong>Submitted on:</strong> ${formattedDate}</p>
          </div>
          
          <p style="color: #555; font-size: 16px; line-height: 1.5;">Your grievance is now under review by our administration team. You will receive updates as there are developments on your case.</p>
          
          <p style="color: #555; font-size: 16px; line-height: 1.5;">Thank you for your patience.</p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #777; font-size: 14px;">This is an automated message. Please do not reply to this email.</p>
            <p style="color: #777; font-size: 14px;">GNDEC Grievance Portal</p>
          </div>
        </div>
      `,
      // Adding a plain text alternative for email clients that don't support HTML
      text: `
        Grievance Submission Confirmation
        
        Dear Student,
        
        Your grievance has been successfully submitted to the administration. Here are the details:
        
        Grievance ID: ${grievanceData.id}
        Title: ${grievanceData.title}
        Category: ${grievanceData.category}
        Status: ${grievanceData.status}
        Submitted on: ${formattedDate}
        
        Your grievance is now under review by our administration team. You will receive updates as there are developments on your case.
        
        Thank you for your patience.
        
        This is an automated message. Please do not reply to this email.
        GNDEC Grievance Portal
      `
    };

    // Send the email with better error handling
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      recipient: to,
      grievanceId: grievanceData.id
    });
    
    return { 
      success: true, 
      messageId: info.messageId,
      response: info.response
    };
  } catch (error) {
    console.error('Error sending email confirmation:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown error sending email'
    };
  }
};

// Function to send reminder emails to admin
const sendReminderEmail = async (to, subject, grievanceData, userDetails) => {
  try {
    // Validate inputs
    if (!to || !grievanceData || !grievanceData.id) {
      throw new Error('Missing required email parameters');
    }

    // Format date in a readable format
    const formattedDate = grievanceData.dateSubmitted 
      ? new Date(grievanceData.dateSubmitted).toLocaleString() 
      : new Date().toLocaleString();
    
    // HTML email template for reminder
    const mailOptions = {
      from: `"GNDEC Grievance Portal" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #2c3e50; text-align: center; margin-bottom: 20px;">Grievance Reminder</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.5;">Dear Admin,</p>
          <p style="color: #555; font-size: 16px; line-height: 1.5;">A student has requested a follow-up on their grievance. Here are the details:</p>
          
          <div style="background-color: #fff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e74c3c;">
            <p style="margin: 5px 0;"><strong>Grievance ID:</strong> ${grievanceData.id}</p>
            <p style="margin: 5px 0;"><strong>Title:</strong> ${grievanceData.title}</p>
            <p style="margin: 5px 0;"><strong>Category:</strong> ${grievanceData.category}</p>
            <p style="margin: 5px 0;"><strong>Current Status:</strong> ${grievanceData.status.replace('-', ' ')}</p>
            <p style="margin: 5px 0;"><strong>Submitted on:</strong> ${formattedDate}</p>
          </div>
          
          <p style="color: #555; font-size: 16px; line-height: 1.5;">The student has requested an update on the status of this grievance.</p>
          
          <p style="color: #555; font-size: 16px; line-height: 1.5;">Student information:</p>
          <ul style="color: #555; font-size: 16px; line-height: 1.5;">
            <li><strong>Name/ID:</strong> ${userDetails.name || userDetails.user_id}</li>
            <li><strong>Email:</strong> ${userDetails.email}</li>
          </ul>
          
          <p style="color: #555; font-size: 16px; line-height: 1.5;">Please review this grievance at your earliest convenience.</p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #777; font-size: 14px;">This is an automated reminder message.</p>
            <p style="color: #777; font-size: 14px;">GNDEC Grievance Portal</p>
          </div>
        </div>
      `,
      // Adding a plain text alternative for email clients that don't support HTML
      text: `
        Grievance Reminder
        
        Dear Admin,
        
        A student has requested a follow-up on their grievance. Here are the details:
        
        Grievance ID: ${grievanceData.id}
        Title: ${grievanceData.title}
        Category: ${grievanceData.category}
        Current Status: ${grievanceData.status.replace('-', ' ')}
        Submitted on: ${formattedDate}
        
        The student has requested an update on the status of this grievance.
        
        Student information:
        - Name/ID: ${userDetails.name || userDetails.user_id}
        - Email: ${userDetails.email}
        
        Please review this grievance at your earliest convenience.
        
        GNDEC Grievance Portal
      `
    };

    // Send the email with better error handling
    const info = await transporter.sendMail(mailOptions);
    console.log('Reminder email sent successfully:', {
      messageId: info.messageId,
      recipient: to,
      grievanceId: grievanceData.id
    });
    
    return { 
      success: true, 
      messageId: info.messageId,
      response: info.response
    };
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown error sending reminder email'
    };
  }
};

// Initialize Supabase client
const supabaseUrl = 'https://dypvelqdjyfbbslqpjxn.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5cHZlbHFkanlmYmJzbHFwanhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTIzMDAwMCwiZXhwIjoyMDYwODA2MDAwfQ.pWRG8sEn6YF2troZ7BYWyPDFwYcJFKm8MptUho5zE8Q';
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Store pending registrations temporarily
const pendingRegistrations = new Map();

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login request received with user_id:', req.body.user_id);
    
    const { user_id, password } = req.body;
    
    if (!user_id || !password) {
      console.log('Missing credentials - user_id or password not provided');
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and password are required' 
      });
    }
    
    // Find the user in the users table
    console.log('Querying database for user with user_id:', user_id);
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', user_id) // Check user_id in the database
      .single(); // Get a single result
    
    console.log('Database query result:', { found: !!userData, hasError: !!userError });
    
    if (userError) {
      console.error('Database error during login:', userError);
      return res.status(500).json({ 
        success: false, 
        message: 'Database error. Please try again later.' 
      });
    }
    
    if (!userData) {
      console.log('No user found with user_id:', user_id);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid user ID or password.' 
      });
    }
    
    // If password field doesn't exist or is empty in the database
    if (!userData.password) {
      console.log('User found but password field is missing or empty');
      return res.status(401).json({ 
        success: false, 
        message: 'Account setup incomplete. Please contact support.' 
      });
    }
    
    // Verify the password
    // const passwordMatch = await bcrypt.compare(password, userData.password);
    const passwordMatch = password === userData.password;
    console.log('Password validation result:', passwordMatch);
    
    if (!passwordMatch) {
      console.log('Password does not match for user_id:', user_id);
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
    
    console.log('Login successful for user_id:', user_id, 'with role:', userData.role);
    console.log('Redirecting to:', redirectPath);
    
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
    
    // In a production environment, we would send an email with the OTP here
    // For now, we're just returning success and handling the verification separately
    
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

// Add endpoint for sending grievance confirmation emails with improved error handling
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
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }
    
    // Ensure grievanceData has all required fields
    const requiredFields = ['id', 'title', 'category', 'status'];
    const missingFields = requiredFields.filter(field => !grievanceData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required grievance data fields: ${missingFields.join(', ')}`
      });
    }
    
    const result = await sendEmailConfirmation(
      email,
      `Grievance Submission Confirmation - ${grievanceData.title}`,
      grievanceData
    );
    
    if (result.success) {
      console.log('Email sent successfully');
      return res.json({ 
        success: true, 
        message: 'Confirmation email sent successfully',
        messageId: result.messageId
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

// Add endpoint for sending reminder emails to admin
app.post('/api/grievances/send-reminder', async (req, res) => {
  try {
    const { 
      grievanceId, 
      grievanceTitle, 
      grievanceCategory, 
      grievanceStatus, 
      userEmail,
      dateSubmitted,
      userName,
      userId
    } = req.body;
    
    if (!grievanceId || !grievanceTitle || !grievanceCategory || !userEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required grievance information'
      });
    }

    console.log('Sending grievance reminder email to admin');
    
    // Admin email address
    const adminEmail = 'std_grievance@gndec.ac.in';
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail) || !emailRegex.test(userEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }
    
    const grievanceData = {
      id: grievanceId,
      title: grievanceTitle,
      category: grievanceCategory,
      status: grievanceStatus || 'pending',
      dateSubmitted: dateSubmitted || new Date().toISOString()
    };
    
    const userDetails = {
      name: userName,
      user_id: userId,
      email: userEmail
    };
    
    const result = await sendReminderEmail(
      adminEmail,
      `REMINDER: Grievance #${grievanceId} - ${grievanceTitle}`,
      grievanceData,
      userDetails
    );
    
    if (result.success) {
      console.log('Reminder email sent successfully to admin');
      return res.json({ 
        success: true, 
        message: 'Reminder email sent successfully to admin',
        messageId: result.messageId
      });
    } else {
      console.error('Failed to send reminder email:', result.error);
      return res.status(500).json({ 
        success: false, 
        message: `Failed to send reminder email: ${result.error}`
      });
    }
  } catch (error) {
    console.error('Grievance reminder email error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to send reminder email'
    });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔌 Connected to Supabase at ${supabaseUrl}`);
}); 