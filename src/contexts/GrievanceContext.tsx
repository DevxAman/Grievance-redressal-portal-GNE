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
      fetchUserGrievances();
      updateStatistics();
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
    
    const grievancesSubscription = supabase
      .channel('public:grievances')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'grievances', filter: `user_id=${user.id}` }, 
        () => {
          fetchUserGrievances();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(grievancesSubscription);
    };
  }, [user]);

  // Fetch grievances for current user
  const fetchUserGrievances = async () => {
    if (!user) return;
    
    dispatch({ type: 'FETCH_GRIEVANCES_REQUEST' });
    
    try {
      const data = await fetchGrievances(String(user.id));
      dispatch({ type: 'FETCH_GRIEVANCES_SUCCESS', payload: data });
    } catch (error) {
      console.error('Fetch grievances error:', error);
      dispatch({ 
        type: 'FETCH_GRIEVANCES_FAILURE', 
        payload: error instanceof Error ? error.message : 'Failed to fetch grievances' 
      });
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
    if (!user) return;
    
    dispatch({ type: 'SUBMIT_GRIEVANCE_REQUEST' });
    
    try {
      const newGrievance = await submitGrievance(formData, String(user.id));
      dispatch({ type: 'SUBMIT_GRIEVANCE_SUCCESS', payload: newGrievance });
      
      // Ensure subscription is triggered after submission
      fetchUserGrievances();
      updateStatistics();
      
      return Promise.resolve(newGrievance);
    } catch (error) {
      console.error('Submit grievance error:', error);
      dispatch({ 
        type: 'SUBMIT_GRIEVANCE_FAILURE', 
        payload: error instanceof Error ? error.message : 'Failed to submit grievance' 
      });
      
      return Promise.reject('Failed to submit grievance');
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