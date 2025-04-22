import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GrievanceCard from '../components/grievance/GrievanceCard';
import { useGrievance } from '../hooks/useGrievance';
import { useAuth } from '../hooks/useAuth';
import { AlertTriangle, CheckCircle2, FileSearch, Loader2 } from 'lucide-react';

const TrackGrievancePage: React.FC = () => {
  const { grievances, fetchGrievances, sendReminder, loading, error } = useGrievance();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [reminderSent, setReminderSent] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchGrievances();
  }, [isAuthenticated, navigate]);
  
  const handleSendReminder = async (grievanceId: string) => {
    try {
      await sendReminder(grievanceId);
      setReminderSent(grievanceId);
      
      // Reset the reminder sent status after 3 seconds
      setTimeout(() => {
        setReminderSent(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to send reminder:', err);
    }
  };
  
  const filteredGrievances = filterStatus === 'all' 
    ? grievances 
    : grievances.filter(g => g.status === filterStatus);
  
  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Track Your Grievances</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            {error}
          </div>
        )}
        
        {reminderSent && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md flex items-center">
            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
            Reminder sent successfully! The concerned authority will be notified.
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">Filter by Status</h2>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === 'pending'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterStatus('under-review')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === 'under-review'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Under Review
              </button>
              <button
                onClick={() => setFilterStatus('in-progress')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === 'in-progress'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setFilterStatus('resolved')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === 'resolved'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Resolved
              </button>
              <button
                onClick={() => setFilterStatus('rejected')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === 'rejected'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Rejected
              </button>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            <p className="text-lg text-gray-600">Loading your grievances...</p>
          </div>
        ) : filteredGrievances.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileSearch className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Grievances Found</h3>
            <p className="text-gray-600 mb-6">
              {filterStatus === 'all' 
                ? "You haven't submitted any grievances yet." 
                : `You don't have any ${filterStatus.replace('-', ' ')} grievances.`}
            </p>
            <button
              onClick={() => navigate('/file-grievance')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              File a New Grievance
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGrievances.map((grievance) => (
              <GrievanceCard 
                key={grievance.id} 
                grievance={grievance} 
                onSendReminder={handleSendReminder}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackGrievancePage;