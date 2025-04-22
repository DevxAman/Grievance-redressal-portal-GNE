import React from 'react';
import { Clock, CheckCircle, AlertCircle, XCircle, Loader2 } from 'lucide-react';
import { Grievance } from '../../types';

interface GrievanceCardProps {
  grievance: Grievance;
  onSendReminder?: (id: string) => void;
}

const GrievanceCard: React.FC<GrievanceCardProps> = ({ grievance, onSendReminder }) => {
  const statusIcons = {
    'pending': <Clock className="h-5 w-5 text-yellow-500" />,
    'under-review': <Loader2 className="h-5 w-5 text-blue-500" />,
    'in-progress': <AlertCircle className="h-5 w-5 text-orange-500" />,
    'resolved': <CheckCircle className="h-5 w-5 text-green-500" />,
    'rejected': <XCircle className="h-5 w-5 text-red-500" />,
  };
  
  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'under-review': 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-orange-100 text-orange-800',
    'resolved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
  };
  
  const categoryLabels = {
    'academic': 'Academic Issues',
    'infrastructure': 'Infrastructure',
    'administrative': 'Administrative',
    'financial': 'Financial Matters',
    'other': 'Other',
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const handleReminderClick = () => {
    if (onSendReminder) {
      onSendReminder(grievance.id);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{grievance.title}</h3>
            <p className="text-sm text-gray-500 mt-1">
              Submitted on {formatDate(grievance.createdAt)}
            </p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[grievance.status]}`}>
            {statusIcons[grievance.status]}
            <span className="ml-1.5 capitalize">{grievance.status.replace('-', ' ')}</span>
          </span>
        </div>
        
        <div className="mt-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {categoryLabels[grievance.category] || grievance.category}
          </span>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-gray-600 line-clamp-3">{grievance.description}</p>
        </div>
        
        <div className="mt-6 flex justify-between items-center">
          <div className="flex space-x-2">
            {grievance.status !== 'resolved' && grievance.status !== 'rejected' && (
              <button
                onClick={handleReminderClick}
                className="inline-flex items-center px-3 py-1.5 border border-blue-600 text-xs font-medium rounded text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Send Reminder
              </button>
            )}
            <button
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              View Details
            </button>
          </div>
          
          {grievance.updatedAt !== grievance.createdAt && (
            <div className="text-xs text-gray-500">
              Updated: {formatDate(grievance.updatedAt)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrievanceCard;