import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import GrievanceCard from '../components/grievance/GrievanceCard';
import GrievanceDetails from '../components/grievance/GrievanceDetails';
import { useGrievance } from '../hooks/useGrievance';
import { useAuth } from '../hooks/useAuth';
import { Grievance } from '../types';
import { AlertTriangle, CheckCircle2, FileSearch, Loader2, Trash2, Clock, Filter } from 'lucide-react';

const TrackGrievancePage: React.FC = () => {
  const { grievances, fetchGrievances, sendReminder, deleteGrievance, loading, error, reminderCooldowns } = useGrievance();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchGrievances();
  }, [isAuthenticated, navigate]);
  
  // Get cooldown info for a grievance
  const getCooldownInfo = (grievanceId: string) => {
    const now = Date.now();
    const cooldownUntil = reminderCooldowns[grievanceId] || 0;
    
    if (now < cooldownUntil) {
      const hoursRemaining = Math.ceil((cooldownUntil - now) / (1000 * 60 * 60));
      return {
        inCooldown: true,
        hoursRemaining
      };
    }
    
    return {
      inCooldown: false,
      hoursRemaining: 0
    };
  };
  
  const handleSendReminder = async (grievanceId: string) => {
    // Get the cooldown info
    const { inCooldown, hoursRemaining } = getCooldownInfo(grievanceId);
    
    if (inCooldown) {
      // Show toast notification for cooldown
      toast.error(
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <span>Reminder in cooldown. Try again in {hoursRemaining} hours.</span>
        </div>
      );
      return;
    }
    
    // Loading toast
    const loadingToast = toast.loading("Sending reminder...");
    
    try {
      await sendReminder(grievanceId);
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // Show success toast
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          <span>Reminder sent successfully! A Gmail window should have opened.</span>
        </div>
      );
    } catch (err) {
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // Get meaningful error message
      let errorMessage = "Failed to send reminder";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      // Show error toast with proper error message
      toast.error(
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          <span>{errorMessage}</span>
        </div>
      );
      console.error('Failed to send reminder:', err);
    }
  };

  const handleViewDetails = (grievance: Grievance) => {
    setSelectedGrievance(grievance);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
  };

  const handleDeleteGrievance = async (grievanceId: string) => {
    // Loading toast
    const loadingToast = toast.loading("Deleting grievance...");
    
    try {
      const success = await deleteGrievance(grievanceId);
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      if (success) {
        // Show success toast
        toast.success(
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            <span>Grievance deleted successfully!</span>
          </div>
        );
      }
    } catch (err) {
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // Show error toast
      toast.error(
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          <span>{err instanceof Error ? err.message : 'Failed to delete grievance'}</span>
        </div>
      );
      console.error('Failed to delete grievance:', err);
    }
  };
  
  const filteredGrievances = filterStatus === 'all' 
    ? grievances 
    : grievances.filter(g => g.status === filterStatus);

  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mt-10">Track Your Grievances</h1>
        
        {error && (
          <div className="mb-6 p-3 sm:p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
            <span className="text-sm sm:text-base">{error}</span>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Filter by Status</h2>
              <button 
                onClick={toggleMobileFilters}
                className="inline-flex items-center sm:hidden px-3 py-1.5 bg-gray-100 rounded-md text-gray-700 text-sm"
              >
                <Filter className="h-4 w-4 mr-1" />
                Filters
              </button>
            </div>
            
            <div className={`grid grid-cols-2 gap-2 ${showMobileFilters ? 'block' : 'hidden'} sm:flex sm:flex-wrap sm:gap-2 sm:block`}>
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  filterStatus === 'pending'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterStatus('under-review')}
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  filterStatus === 'under-review'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Under Review
              </button>
              <button
                onClick={() => setFilterStatus('in-progress')}
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  filterStatus === 'in-progress'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setFilterStatus('resolved')}
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  filterStatus === 'resolved'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Resolved
              </button>
              <button
                onClick={() => setFilterStatus('rejected')}
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
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
          <div className="flex flex-col items-center justify-center p-8 sm:p-12">
            <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-blue-500 animate-spin mb-4" />
            <p className="text-base sm:text-lg text-gray-600">Loading your grievances...</p>
          </div>
        ) : filteredGrievances.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
            <FileSearch className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Grievances Found</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              {filterStatus === 'all' 
                ? "You haven't submitted any grievances yet." 
                : `You don't have any ${filterStatus.replace('-', ' ')} grievances.`}
            </p>
            <button
              onClick={() => navigate('/file-grievance')}
              className="px-4 py-2 bg-blue-600 text-white text-sm sm:text-base rounded-md hover:bg-blue-700 transition-colors"
            >
              File a New Grievance
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredGrievances.map((grievance) => (
              <GrievanceCard 
                key={grievance.id} 
                grievance={grievance} 
                onSendReminder={handleSendReminder}
                onViewDetails={handleViewDetails}
                onDelete={handleDeleteGrievance}
                cooldownInfo={getCooldownInfo(grievance.id)}
                showDescription={true}
              />
            ))}
          </div>
        )}
      </div>

      <GrievanceDetails 
        grievance={selectedGrievance}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
      />
    </div>
  );
};

export default TrackGrievancePage;