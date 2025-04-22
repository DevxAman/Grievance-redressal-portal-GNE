import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GrievanceForm from '../components/grievance/GrievanceForm';
import { useGrievance } from '../hooks/useGrievance';
import { useAuth } from '../hooks/useAuth';
import { CheckCircle } from 'lucide-react';

const FileGrievancePage: React.FC = () => {
  const { submitGrievance, error, loading } = useGrievance();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleSubmit = async (formData: FormData) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      await submitGrievance(formData);
      setIsSubmitted(true);
      
      // Redirect to dashboard after a delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err) {
      console.error('Failed to submit grievance:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {loading && (
          <div className="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-md">
            Submitting your grievance...
          </div>
        )}
        
        {isSubmitted ? (
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Grievance Submitted Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your grievance has been successfully submitted. You will be redirected to your dashboard where you can track the status of your grievance.
            </p>
            <div className="inline-block animate-pulse bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm">
              Redirecting to dashboard...
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">File a New Grievance</h1>
            <p className="mb-8 text-gray-600 text-center max-w-2xl mx-auto">
              Please provide detailed information about your grievance. The more specific you are, the better we can assist you in resolving the issue.
            </p>
            <GrievanceForm onSubmit={handleSubmit} />
          </>
        )}
      </div>
    </div>
  );
};

export default FileGrievancePage;