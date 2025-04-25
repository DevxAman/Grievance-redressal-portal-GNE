import React from 'react';
import { Clock, CheckCircle, AlertCircle, XCircle, Loader2, Trash2 } from 'lucide-react';
import { Grievance } from '../../types';
import { formatDate } from '../../lib/dateUtils';

interface CooldownInfo {
  inCooldown: boolean;
  hoursRemaining: number;
}

interface GrievanceCardProps {
  grievance: Grievance;
  onSendReminder?: (id: string) => void;
  onViewDetails: (grievance: Grievance) => void;
  onDelete: (id: string) => void;
  cooldownInfo?: CooldownInfo;
}

const GrievanceCard: React.FC<GrievanceCardProps> = ({ 
  grievance, 
  onSendReminder,
  onViewDetails,
  onDelete,
  cooldownInfo = { inCooldown: false, hoursRemaining: 0 }
}) => {
  const statusIcons = {
    'pending': <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />,
    'under-review': <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />,
    'in-progress': <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />,
    'resolved': <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />,
    'rejected': <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />,
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
  
  const handleReminderClick = () => {
    if (onSendReminder) {
      onSendReminder(grievance.id);
    }
  };

  const handleViewDetailsClick = () => {
    onViewDetails(grievance);
  };

  const handleDeleteClick = () => {
    if (window.confirm('Are you sure you want to delete this grievance? This action cannot be undone.')) {
      onDelete(grievance.id);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg border border-gray-100">
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-2">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-1">{grievance.title}</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Submitted on {formatDate(grievance.created_at)}
            </p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[grievance.status]}`}>
            {statusIcons[grievance.status]}
            <span className="ml-1 sm:ml-1.5 capitalize">{grievance.status.replace('-', ' ')}</span>
          </span>
        </div>
        
        <div className="mt-2 sm:mt-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {categoryLabels[grievance.category] || grievance.category}
          </span>
        </div>
        
        <div className="mt-3 sm:mt-4">
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 sm:line-clamp-3">{grievance.description}</p>
        </div>
        
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="flex flex-wrap gap-2">
            {grievance.status !== 'resolved' && grievance.status !== 'rejected' && (
              <button
                onClick={handleReminderClick}
                disabled={cooldownInfo.inCooldown}
                className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                  cooldownInfo.inCooldown
                    ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 focus:ring-blue-500'
                }`}
                title={cooldownInfo.inCooldown ? `In cooldown. Try again in ${cooldownInfo.hoursRemaining} hours.` : 'Send reminder'}
              >
                {cooldownInfo.inCooldown ? (
                  <>
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    {cooldownInfo.hoursRemaining}h
                  </>
                ) : (
                  'Send Reminder'
                )}
              </button>
            )}
            <button
              onClick={handleViewDetailsClick}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              View Details
            </button>
            <button
              onClick={handleDeleteClick}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md border border-red-300 text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete
            </button>
          </div>
          
          {grievance.updated_at !== grievance.created_at && (
            <div className="text-xs text-gray-500 mt-2 sm:mt-0">
              Updated: {formatDate(grievance.updated_at)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrievanceCard;