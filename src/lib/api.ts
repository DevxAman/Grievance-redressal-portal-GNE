import { supabase } from './supabase';
import type { Database } from '../types/supabase';
import type { User, Grievance } from '../types';
import bcrypt from 'bcryptjs';

// Auth APIs
export const login = async (user_id: string, password: string): Promise<User> => {
  try {
    console.log('Attempting login with user_id:', user_id);
    
    // Find the user in the users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (userError) {
      console.error('Database error during login:', userError);
      throw new Error('User not found. Please check your credentials.');
    }

    if (!userData) {
      console.error('No user data found for user_id:', user_id);
      throw new Error('Invalid user ID or password.');
    }

    console.log('User found:', { ...userData, password: '[REDACTED]' });

    // If password field doesn't exist or is empty in the database
    if (!userData.password) {
      console.error('User has no password set');
      throw new Error('Account setup incomplete. Please contact support.');
    }

    // Verify the password
    try {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      
      if (!passwordMatch) {
        console.error('Password mismatch for user:', user_id);
        throw new Error('Invalid user ID or password.');
      }
    } catch (bcryptError) {
      console.error('Error during password verification:', bcryptError);
      throw new Error('Authentication error. Please try again later.');
    }

    // Remove password from returned user
    const { password: _, ...userWithoutPassword } = userData;
    
    return userWithoutPassword as User;
  } catch (error: unknown) {
    console.error('Login error:', (error as Error).message);
    throw error;
  }
};

export const signup = async (
  user_id: string, 
  email: string, 
  password: string
): Promise<{ success: boolean; message: string; otp?: string }> => {
  try {
    // Validate email format
    if (!email.endsWith('@gndec.ac.in')) {
      throw new Error('Email must be a valid GNDEC email address (@gndec.ac.in)');
    }

    // Check if user_id already exists
    const { data: existingUserId, error: userIdError } = await supabase
      .from('users')
      .select('user_id')
      .eq('user_id', user_id)
      .single();

    if (userIdError && userIdError.code !== 'PGRST116') { // PGRST116 is the "not found" error code
      console.error('Error checking existing user_id:', userIdError);
      throw new Error('Database error. Please try again later.');
    }

    if (existingUserId) {
      throw new Error('User ID already exists. Please choose a different one.');
    }

    // Check if email already exists
    const { data: existingEmail, error: emailError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (emailError && emailError.code !== 'PGRST116') { // PGRST116 is the "not found" error code
      console.error('Error checking existing email:', emailError);
      throw new Error('Database error. Please try again later.');
    }

    if (existingEmail) {
      throw new Error('Email already registered. Please use a different email or login.');
    }

    // Default role for new signups
    const role = 'student';

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP for email verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // For demo purposes, log the OTP to console
    console.log(`OTP for ${email}: ${otp}`);

    // In a real system, you would send the OTP via email
    // For now, we'll return it for testing purposes
    return { 
      success: true, 
      message: 'Verification code sent to your email. Please verify to complete registration.',
      otp
    };
  } catch (error: unknown) {
    console.error('Signup error:', (error as Error).message);
    return { success: false, message: (error as Error).message };
  }
};

export const verifyEmail = async (
  user_id: string,
  email: string,
  hashedPassword: string,
  role: string,
  otp: string,
  providedOtp: string
): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    if (otp !== providedOtp) {
      throw new Error('Invalid verification code. Please try again.');
    }

    // Insert into users table
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          user_id,
          email,
          password: hashedPassword,
          role,
          created_at: new Date().toISOString(),
        }
      ])
      .select();

    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error('Failed to create user.');
    }

    // Remove password from returned user
    const { password: _, ...userWithoutPassword } = data[0];

    return { 
      success: true, 
      message: 'Email verified and account created successfully!',
      user: userWithoutPassword as User 
    };
  } catch (error: unknown) {
    console.error('Email verification error:', (error as Error).message);
    return { success: false, message: (error as Error).message };
  }
};

// User APIs
export const fetchCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  // Get the user profile from our users table
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (!data) return null;
  
  return mapUserData(data);
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  
  // Get user profile data
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user?.id)
    .single();
  
  if (!userData) throw new Error('User profile not found');
  
  return mapUserData(userData);
};

export const signUp = async (userData: {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: string;
  collegeRollNumber?: string;
}) => {
  // First create the auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
  });
  
  if (authError) throw authError;
  
  if (!authData.user) {
    throw new Error('Failed to create user');
  }
  
  // Then create the profile in our users table
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email: userData.email,
      name: userData.name,
      role: userData.role as 'student' | 'clerk' | 'admin' | 'dsw',
      phone_number: userData.phoneNumber,
      college_roll_number: userData.collegeRollNumber,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) {
    // If profile creation fails, we should clean up the auth user
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw error;
  }
  
  return mapUserData(data);
};

export const signOut = async () => {
  await supabase.auth.signOut();
};

// Grievance APIs
export const fetchGrievances = async (userId?: string) => {
  let query = supabase
    .from('grievances')
    .select(`
      *,
      responses (*)
    `);
  
  // If userId is provided, filter by user
  if (userId) {
    query = query.eq('user_id', userId);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return data.map(mapGrievanceData);
};

export const fetchGrievanceById = async (grievanceId: string) => {
  const { data, error } = await supabase
    .from('grievances')
    .select(`
      *,
      responses (*)
    `)
    .eq('id', grievanceId)
    .single();
  
  if (error) throw error;
  
  return mapGrievanceData(data);
};

export const submitGrievance = async (
  formData: FormData,
  userId: string
) => {
  // First handle file uploads if any
  const documents: string[] = [];
  
  const files = formData.getAll('documents') as File[];
  if (files && files.length > 0) {
    for (const file of files) {
      if (file.size > 0) {
        const fileName = `${userId}/${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from('grievance-documents')
          .upload(fileName, file);
        
        if (error) throw error;
        
        // Get the public URL
        const { data: publicUrlData } = supabase.storage
          .from('grievance-documents')
          .getPublicUrl(fileName);
        
        documents.push(publicUrlData.publicUrl);
      }
    }
  }
  
  // Now create the grievance
  const { data, error } = await supabase
    .from('grievances')
    .insert({
      user_id: userId,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as 'academic' | 'infrastructure' | 'administrative' | 'financial' | 'other',
      status: 'pending',
      documents,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return mapGrievanceData(data);
};

export const updateGrievanceStatus = async (
  grievanceId: string,
  status: string,
  adminId?: string
) => {
  const updates: Database['public']['Tables']['grievances']['Update'] = {
    status: status as 'pending' | 'under-review' | 'in-progress' | 'resolved' | 'rejected',
    updated_at: new Date().toISOString(),
  };
  
  if (adminId) {
    updates.assigned_to = adminId;
  }
  
  const { data, error } = await supabase
    .from('grievances')
    .update(updates)
    .eq('id', grievanceId)
    .select()
    .single();
  
  if (error) throw error;
  
  return mapGrievanceData(data);
};

export const addResponse = async (
  grievanceId: string,
  adminId: string,
  responseText: string
) => {
  // Add the response
  const { error } = await supabase
    .from('responses')
    .insert({
      grievance_id: grievanceId,
      admin_id: adminId,
      response_text: responseText,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Update the grievance's updated_at timestamp
  await supabase
    .from('grievances')
    .update({
      updated_at: new Date().toISOString(),
    })
    .eq('id', grievanceId);
  
  return { success: true };
};

// Statistics APIs
export const fetchStatistics = async () => {
  const { data, error } = await supabase
    .from('statistics')
    .select('*')
    .order('last_updated', { ascending: false })
    .limit(1)
    .single();
  
  if (error) throw error;
  
  return data;
};

// Helper functions to map database models to app models
function mapUserData(user: Database['public']['Tables']['users']['Row']): User {
  return {
    id: user.id,
    user_id: user.user_id,
    email: user.email,
    role: user.role as 'student' | 'clerk' | 'dsw' | 'admin',
    created_at: user.created_at
  };
}

function mapGrievanceData(
  grievance: Database['public']['Tables']['grievances']['Row'] & {
    responses?: Database['public']['Tables']['responses']['Row'][];
  }
): Grievance {
  return {
    id: grievance.id,
    userId: grievance.user_id,
    title: grievance.title,
    description: grievance.description,
    category: grievance.category,
    status: grievance.status,
    createdAt: grievance.created_at,
    updatedAt: grievance.updated_at,
    assignedTo: grievance.assigned_to,
    documents: grievance.documents,
    feedback: grievance.feedback,
    responses: grievance.responses ? grievance.responses.map(response => ({
      id: response.id,
      grievanceId: response.grievance_id,
      adminId: response.admin_id,
      responseText: response.response_text,
      createdAt: response.created_at,
    })) : undefined,
  };
} 