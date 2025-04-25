import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useGrievance } from '../hooks/useGrievance';
import GrievanceCard from '../components/grievance/GrievanceCard';
import { PlusCircle, FilePlus, BarChart3, HelpCircle, LogOut, Loader2, User } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { grievances, fetchGrievances, loading } = useGrievance();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Debug log
    console.log('Auth state in DashboardPage:', { user, isAuthenticated, loading });
    
    if (loading) return; // Don't check anything while loading
    
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }
    
    // User is authenticated, fetch grievances
    fetchGrievances();
  }, [isAuthenticated, loading, navigate, fetchGrievances]);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const pendingGrievances = grievances.filter(g => g.status !== 'resolved' && g.status !== 'rejected');
  const resolvedGrievances = grievances.filter(g => g.status === 'resolved');
  
  // Calculate statistics
  const totalGrievances = grievances.length;
  const pendingCount = pendingGrievances.length;
  const resolvedCount = resolvedGrievances.length;
  const rejectedCount = grievances.filter(g => g.status === 'rejected').length;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          {user && (
            <div className="mt-2 text-gray-600 flex items-center">
              <span>Welcome back, </span>
              <Link to="/dashboard" className="flex items-center ml-1 text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                <User className="h-4 w-4 mr-1" />
                <span>{user.user_id || 'User'}</span>
              </Link>
            </div>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => navigate('/file-grievance')}
            className="bg-white flex items-center justify-center p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <FilePlus className="h-6 w-6 text-blue-600 mr-2" />
            <span className="font-medium">File New Grievance</span>
          </button>
          
          <button
            onClick={() => navigate('/track-grievance')}
            className="bg-white flex items-center justify-center p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <BarChart3 className="h-6 w-6 text-green-600 mr-2" />
            <span className="font-medium">Track Grievances</span>
          </button>
          
          <button
            onClick={() => navigate('/how-it-works')}
            className="bg-white flex items-center justify-center p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <HelpCircle className="h-6 w-6 text-purple-600 mr-2" />
            <span className="font-medium">How It Works</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="bg-white flex items-center justify-center p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <LogOut className="h-6 w-6 text-red-600 mr-2" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
            <div className="text-3xl font-bold text-blue-700 mb-1">{totalGrievances}</div>
            <div className="text-sm text-blue-600">Total Grievances</div>
          </div>
          
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-100">
            <div className="text-3xl font-bold text-yellow-700 mb-1">{pendingCount}</div>
            <div className="text-sm text-yellow-600">Pending Grievances</div>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg border border-green-100">
            <div className="text-3xl font-bold text-green-700 mb-1">{resolvedCount}</div>
            <div className="text-sm text-green-600">Resolved Grievances</div>
          </div>
          
          <div className="bg-red-50 p-6 rounded-lg border border-red-100">
            <div className="text-3xl font-bold text-red-700 mb-1">{rejectedCount}</div>
            <div className="text-sm text-red-600">Rejected Grievances</div>
          </div>
        </div>
        
        {/* Recent Grievances */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Grievances</h2>
            <button
              onClick={() => navigate('/track-grievance')}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <span className="mr-1">View All</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </button>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-md">
              <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-600">Loading your grievances...</p>
            </div>
          ) : grievances.length === 0 ? (
            <div className="bg-white p-12 rounded-lg shadow-md text-center">
              <div className="inline-block p-3 rounded-full bg-blue-100 mb-4">
                <PlusCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Grievances Found</h3>
              <p className="text-gray-600 mb-6">You haven't submitted any grievances yet.</p>
              <button
                onClick={() => navigate('/file-grievance')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                File Your First Grievance
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {grievances.slice(0, 6).map((grievance) => (
                <GrievanceCard 
                  key={grievance.id} 
                  grievance={grievance}
                  showTrackButton={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;