import emailjs from '@emailjs/browser';

// Updated interface with index signature to be compatible with Record<string, unknown>
interface EmailParams {
  to_email: string;
  to_name: string;
  grievance_id: string;
  grievance_title: string;
  grievance_category: string;
  submission_date: string;
  [key: string]: unknown;
}

// Initialize EmailJS with your User ID
export const initEmailJS = (userID: string) => {
  console.log('[EmailService] Initializing EmailJS with User ID:', userID ? 'Valid ID provided' : 'No valid ID');
  try {
    emailjs.init(userID);
    console.log('[EmailService] EmailJS initialized successfully');
  } catch (error) {
    console.error('[EmailService] Error initializing EmailJS:', error);
  }
};

// Send a confirmation email when a grievance is submitted
export const sendGrievanceConfirmation = async (
  templateID: string,
  serviceID: string,
  params: EmailParams
): Promise<{ success: boolean; message: string }> => {
  console.log('[EmailService] Attempting to send email with:', { 
    templateID, 
    serviceID, 
    recipient: params.to_email,
    subject: `Grievance Submission: ${params.grievance_title}`
  });
  
  try {
    // Ensure we have valid parameters
    if (!templateID || !serviceID) {
      console.error('[EmailService] Missing templateID or serviceID');
      return { success: false, message: 'Missing template or service ID' };
    }
    
    if (!params.to_email) {
      console.error('[EmailService] Missing recipient email address');
      return { success: false, message: 'Missing recipient email address' };
    }
    
    const response = await emailjs.send(serviceID, templateID, params);
    console.log('[EmailService] Confirmation email sent successfully:', response);
    
    if (response.status === 200) {
      return { success: true, message: 'Confirmation email sent successfully' };
    } else {
      console.warn('[EmailService] Unexpected response status:', response.status);
      return { success: false, message: `Unexpected response status: ${response.status}` };
    }
  } catch (error) {
    console.error('[EmailService] Error sending confirmation email:', error);
    // More detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[EmailService] Error details:', errorMessage);
    
    return { success: false, message: `Failed to send confirmation email: ${errorMessage}` };
  }
};

// Format date to a user-friendly string
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}; 