import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GrievanceProvider } from './contexts/GrievanceContext';
import { initEmailJS } from './lib/emailService';

// Layout components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import FileGrievancePage from './pages/FileGrievancePage';
import TrackGrievancePage from './pages/TrackGrievancePage';
import HowItWorksPage from './pages/HowItWorksPage';
import ContactPage from './pages/ContactPage';

const App: React.FC = () => {
  useEffect(() => {
    // Initialize EmailJS
    try {
      // Get EmailJS User ID from environment variables
      const emailJSUserID = import.meta.env.VITE_EMAILJS_USER_ID;
      
      console.log('Environment Variables Check:');
      console.log('- VITE_EMAILJS_USER_ID:', emailJSUserID ? 'Present' : 'Missing');
      console.log('- VITE_EMAILJS_SERVICE_ID:', import.meta.env.VITE_EMAILJS_SERVICE_ID ? 'Present' : 'Missing');
      console.log('- VITE_EMAILJS_TEMPLATE_ID:', import.meta.env.VITE_EMAILJS_TEMPLATE_ID ? 'Present' : 'Missing');
      
      if (!emailJSUserID || emailJSUserID === 'your_emailjs_user_id') {
        console.warn('EmailJS User ID is missing or using the placeholder value. Email functionality will not work correctly.');
        return;
      }
      
      initEmailJS(emailJSUserID);
      console.log('EmailJS initialized successfully with User ID:', emailJSUserID.substring(0, 5) + '...');
    } catch (error) {
      console.error('Error initializing EmailJS:', error);
    }
  }, []);

  return (
    <AuthProvider>
      <GrievanceProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/file-grievance" element={<FileGrievancePage />} />
                <Route path="/track-grievance" element={<TrackGrievancePage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/contact" element={<ContactPage />} />
                
                {/* Add a catch-all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </GrievanceProvider>
    </AuthProvider>
  );
};

export default App;