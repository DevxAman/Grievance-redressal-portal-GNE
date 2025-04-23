import React, { createContext, useReducer, useEffect } from 'react';
import { Grievance, Statistic } from '../types';
import { useAuth } from '../hooks/useAuth';
import { 
  fetchGrievances, 
  submitGrievance, 
  fetchStatistics, 
  updateGrievanceStatus 
} from '../lib/api';
import { supabase } from '../lib/supabase';
import { sendGrievanceConfirmation, formatDate } from '../lib/emailService';

interface GrievanceState {
  grievances: Grievance[];
  statistics: Statistic | null;
  loading: boolean;
  error: string | null;
}

interface GrievanceContextType extends GrievanceState {
  fetchUserGrievances: () => Promise<void>;
  submitNewGrievance: (formData: FormData) => Promise<Grievance | undefined>;
  sendReminder: (grievanceId: string) => Promise<void>;
  updateStatistics: () => Promise<void>;
  fetchGrievances: () => void;
}

export const GrievanceContext = createContext<GrievanceContextType | undefined>(undefined);

type GrievanceAction =
  | { type: 'FETCH_GRIEVANCES_REQUEST' }
  | { type: 'FETCH_GRIEVANCES_SUCCESS'; payload: Grievance[] }
  | { type: 'FETCH_GRIEVANCES_FAILURE'; payload: string }
  | { type: 'FETCH_STATISTICS_REQUEST' }
  | { type: 'FETCH_STATISTICS_SUCCESS'; payload: Statistic }
  | { type: 'FETCH_STATISTICS_FAILURE'; payload: string }
  | { type: 'SUBMIT_GRIEVANCE_REQUEST' }
  | { type: 'SUBMIT_GRIEVANCE_SUCCESS'; payload: Grievance }
  | { type: 'SUBMIT_GRIEVANCE_FAILURE'; payload: string }
  | { type: 'SEND_REMINDER_REQUEST' }
  | { type: 'SEND_REMINDER_SUCCESS'; payload: string }
  | { type: 'SEND_REMINDER_FAILURE'; payload: string };

const initialState: GrievanceState = {
  grievances: [],
  statistics: null,
  loading: false,
  error: null,
};

const grievanceReducer = (state: GrievanceState, action: GrievanceAction): GrievanceState => {
  switch (action.type) {
    case 'FETCH_GRIEVANCES_REQUEST':
    case 'FETCH_STATISTICS_REQUEST':
    case 'SUBMIT_GRIEVANCE_REQUEST':
    case 'SEND_REMINDER_REQUEST':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'FETCH_GRIEVANCES_SUCCESS':
      return {
        ...state,
        grievances: action.payload,
        loading: false,
        error: null,
      };
    case 'FETCH_STATISTICS_SUCCESS':
      return {
        ...state,
        statistics: action.payload,
        loading: false,
        error: null,
      };
    case 'SUBMIT_GRIEVANCE_SUCCESS':
      return {
        ...state,
        grievances: [action.payload, ...state.grievances],
        loading: false,
        error: null,
      };
    case 'FETCH_GRIEVANCES_FAILURE':
    case 'FETCH_STATISTICS_FAILURE':
    case 'SUBMIT_GRIEVANCE_FAILURE':
    case 'SEND_REMINDER_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'SEND_REMINDER_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
};

export const GrievanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(grievanceReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Fetch grievances when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('[GrievanceContext] User authenticated, fetching grievances');
      console.log('[GrievanceContext] User details:', {
        id: user.id,
        user_id: user.user_id,
        role: user.role,
        email: user.email
      });
      
      // Validate user_id is a valid UUID
      if (!user.id || typeof user.id !== 'string') {
        console.error('[GrievanceContext] Invalid user id:', user.id);
        dispatch({ 
          type: 'FETCH_GRIEVANCES_FAILURE', 
          payload: 'Invalid user ID format' 
        });
        return;
      }
      
      fetchUserGrievances().catch(error => {
        console.error('[GrievanceContext] Error in initial grievance fetch:', error);
      });
      updateStatistics().catch(error => {
        console.error('[GrievanceContext] Error in initial statistics fetch:', error);
      });
    } else {
      console.log('[GrievanceContext] User not authenticated or missing:', {
        isAuthenticated,
        user: user ? {
          id: user.id,
          user_id: user.user_id,
          role: user.role
        } : null
      });
      dispatch({ type: 'FETCH_GRIEVANCES_SUCCESS', payload: [] });
    }
  }, [isAuthenticated, user]);

  // Set up real-time subscription for statistics changes
  useEffect(() => {
    const statisticsSubscription = supabase
      .channel('public:statistics')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'statistics' }, 
        () => {
          updateStatistics();
        }
      )
      .subscribe();
    
    // Set up interval for stats refresh (every 2 minutes)
    const statsInterval = setInterval(() => {
      updateStatistics();
    }, 2 * 60 * 1000);

    return () => {
      supabase.removeChannel(statisticsSubscription);
      clearInterval(statsInterval);
    };
  }, []);
  
  // Set up real-time subscription for grievance changes
  useEffect(() => {
    if (!user) return;
    
    const subscription = supabase
      .channel('grievance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'grievances',
          filter: `user_id=${user.id}`
        },
        () => {
          fetchUserGrievances();
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Fetch grievances for current user
  const fetchUserGrievances = async () => {
    if (!user) {
      console.error('No authenticated user found');
      return;
    }

    console.log('Fetching grievances for user:', {
      id: user.id,
      user_id: user.user_id,
      role: user.role
    });
    try {
      const data = await fetchGrievances(user.id);
      console.log('Fetched grievances:', data);
      dispatch({ type: 'FETCH_GRIEVANCES_SUCCESS', payload: data });
    } catch (error) {
      console.error('Error fetching grievances:', error);
      dispatch({ type: 'FETCH_GRIEVANCES_FAILURE', payload: 'Failed to fetch grievances' });
    }
  };

  // Update statistics
  const updateStatistics = async () => {
    dispatch({ type: 'FETCH_STATISTICS_REQUEST' });
    
    try {
      const data = await fetchStatistics();
      dispatch({ type: 'FETCH_STATISTICS_SUCCESS', payload: data });
    } catch (error) {
      console.error('Fetch statistics error:', error);
      dispatch({ 
        type: 'FETCH_STATISTICS_FAILURE', 
        payload: error instanceof Error ? error.message : 'Failed to fetch statistics' 
      });
    }
  };

  // Submit new grievance
  const submitNewGrievance = async (formData: FormData) => {
    if (!user) {
      console.error('No authenticated user found');
      return;
    }

    console.log('Submitting new grievance for user:', user.id);
    try {
      const data = await submitGrievance(formData, user.id);
      if (data) {
        dispatch({ type: 'SUBMIT_GRIEVANCE_SUCCESS', payload: data });
        
        // Send confirmation email
        try {
          // Get EmailJS template and service IDs from environment variables
          const templateID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
          const serviceID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
          
          // Debug information
          console.log('Email.js Configuration:', {
            templateID,
            serviceID,
            userEmail: user.email,
            userName: user.name,
            grievanceId: data.id
          });
          
          if (!templateID || !serviceID) {
            console.warn('EmailJS template or service ID not found in environment variables');
            return data;
          }
          
          // Prepare email parameters
          const emailParams = {
            to_email: user.email,
            to_name: user.name || 'Student',
            grievance_id: data.id,
            grievance_title: data.title,
            grievance_category: data.category,
            submission_date: formatDate(data.created_at)
          };
          
          console.log('Sending email with params:', emailParams);
          
          // Send the confirmation email
          const emailResult = await sendGrievanceConfirmation(
            templateID,
            serviceID,
            emailParams
          );
          
          console.log('Email sending result:', emailResult);
          
          if (emailResult.success) {
            console.log('Confirmation email sent for grievance:', data.id);
          } else {
            console.warn('Failed to send confirmation email:', emailResult.message);
          }
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          // We don't want to fail the submission if email fails
        }
        
        return data;
      }
    } catch (error) {
      console.error('Error submitting grievance:', error);
      dispatch({ type: 'SUBMIT_GRIEVANCE_FAILURE', payload: 'Failed to submit grievance' });
    }
  };

  // Send reminder for a grievance
  const sendReminder = async (grievanceId: string) => {
    if (!user) return;
    
    dispatch({ type: 'SEND_REMINDER_REQUEST' });
    
    try {
      // Update status to include reminder flag
      await updateGrievanceStatus(grievanceId, 'under-review');
      
      dispatch({ type: 'SEND_REMINDER_SUCCESS', payload: grievanceId });
      
      return Promise.resolve();
    } catch (error) {
      console.error('Send reminder error:', error);
      dispatch({ 
        type: 'SEND_REMINDER_FAILURE', 
        payload: error instanceof Error ? error.message : 'Failed to send reminder' 
      });
      
      return Promise.reject('Failed to send reminder');
    }
  };

  return (
    <GrievanceContext.Provider 
      value={{ 
        ...state, 
        fetchUserGrievances, 
        submitNewGrievance,
        sendReminder,
        updateStatistics,
        fetchGrievances
      }}
    >
      {children}
    </GrievanceContext.Provider>
  );
};