import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

/**
 * Helper component for debugging authentication state
 * Add this to pages during development to troubleshoot authentication issues
 */
const AuthDebugger: React.FC = () => {
  const { user, session, loading, isAuthenticated } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  // Force refresh the component to see latest state
  const refreshState = () => {
    setRefreshCount(prev => prev + 1);
  };

  useEffect(() => {
    // Log authentication state changes to console
    console.log('[AuthDebugger] Auth state:', { 
      isAuthenticated, 
      user, 
      session: session ? { id: session.access_token } : null,
      loading 
    });
  }, [user, session, loading, isAuthenticated, refreshCount]);

  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-800 text-white p-3 rounded-lg shadow-lg text-xs font-mono max-w-md">
      <div className="flex justify-between items-center mb-1">
        <h5 className="font-semibold">Auth Debugger</h5>
        <div className="flex gap-2">
          <button 
            onClick={refreshState}
            className="px-2 py-1 bg-blue-600 rounded-md hover:bg-blue-700 text-xs"
          >
            Refresh
          </button>
          <button 
            onClick={() => setExpanded(prev => !prev)}
            className="px-2 py-1 bg-gray-600 rounded-md hover:bg-gray-700 text-xs"
          >
            {expanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-2">
        <div className="font-semibold">Authenticated:</div>
        <div className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>
          {isAuthenticated ? 'Yes' : 'No'}
        </div>
        
        <div className="font-semibold">Loading:</div>
        <div className={loading ? 'text-yellow-400' : 'text-gray-400'}>
          {loading ? 'Yes' : 'No'}
        </div>
        
        <div className="font-semibold">User:</div>
        <div className={user ? 'text-green-400' : 'text-red-400'}>
          {user ? user.user_id : 'null'}
        </div>
        
        <div className="font-semibold">Session:</div>
        <div className={session ? 'text-green-400' : 'text-red-400'}>
          {session ? 'Active' : 'null'}
        </div>
      </div>
      
      {expanded && (
        <>
          <div className="border-t border-gray-600 my-2 pt-2">
            <div className="font-semibold mb-1">User Details:</div>
            <pre className="bg-gray-900 p-2 rounded overflow-auto max-h-28 text-xs">
              {user ? JSON.stringify(user, null, 2) : 'null'}
            </pre>
          </div>
          
          {session && (
            <div className="border-t border-gray-600 my-2 pt-2">
              <div className="font-semibold mb-1">Session:</div>
              <pre className="bg-gray-900 p-2 rounded overflow-auto max-h-28 text-xs">
                {JSON.stringify({ 
                  user: session.user,
                  access_token: `${session.access_token.substring(0, 10)}...`,
                  expires_at: session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'unknown'
                }, null, 2)}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AuthDebugger; 