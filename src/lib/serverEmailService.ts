import { Grievance } from '../types';

/**
 * Send a confirmation email for a grievance submission using server-side nodemailer
 * @param email Recipient email address
 * @param grievanceData Data of the submitted grievance
 * @returns Promise resolving to success status and message
 */
export const sendGrievanceConfirmationEmail = async (
  email: string,
  grievanceData: Grievance
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('[ServerEmailService] Sending confirmation email for grievance:', grievanceData.id);
    
    // Make API call to server endpoint
    const response = await fetch('/api/grievances/send-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        grievanceData
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('[ServerEmailService] Email sent successfully');
      return { success: true, message: 'Confirmation email sent successfully' };
    } else {
      console.error('[ServerEmailService] Failed to send email:', result.message);
      return { success: false, message: result.message || 'Failed to send email' };
    }
  } catch (error) {
    console.error('[ServerEmailService] Error sending confirmation email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message: `Failed to send confirmation email: ${errorMessage}` };
  }
}; 