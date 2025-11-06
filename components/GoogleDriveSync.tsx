import React, { useState, useEffect, useCallback } from 'react';
import { Application } from '../types';
import * as driveService from '../services/googleDriveService';
import { HardDrive, RefreshCw, LogOut, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface GoogleDriveSyncProps {
  applications: Application[];
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
}

const GoogleDriveSync: React.FC<GoogleDriveSyncProps> = ({ applications, setApplications }) => {
  const [isGapiReady, setIsGapiReady] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [status, setStatus] = useState<{ type: 'info' | 'success' | 'error'; message: string }>({
    type: 'info',
    message: 'Connect your Google Drive account to back up and sync your data.',
  });
  const [lastSync, setLastSync] = useLocalStorage<string | null>('driveLastSync', null);

  const updateSignInStatus = useCallback((signedIn: boolean) => {
    setIsSignedIn(signedIn);
    if (signedIn) {
      setStatus({ type: 'info', message: 'Connected to Google Drive. Ready to sync.' });
    } else {
      setStatus({ type: 'info', message: 'Connect your Google Drive account to back up and sync your data.' });
      setLastSync(null);
    }
  }, [setLastSync]);

  useEffect(() => {
    driveService.loadGapiScript(() => {
      driveService.initGapiClient(() => {
        setIsGapiReady(true);
        driveService.updateTokenStatus(updateSignInStatus);
      });
    });
  }, [updateSignInStatus]);
  
  const handleAuthClick = () => {
    if (!isGapiReady) return;
    driveService.handleAuthClick();
  };
  
  const handleSignoutClick = () => {
    if (!isGapiReady) return;
    driveService.handleSignoutClick();
  };

  const handleSync = async () => {
    if (!isSignedIn) {
      setStatus({ type: 'error', message: 'You must be signed in to sync.' });
      return;
    }
    setIsSyncing(true);
    setStatus({ type: 'info', message: 'Syncing started...' });
    
    try {
      const fileId = await driveService.findFile();
      let remoteApps: Application[] = [];
      if (fileId) {
        setStatus({ type: 'info', message: 'Found existing data file, downloading...' });
        remoteApps = await driveService.getFileContent(fileId);
      } else {
        setStatus({ type: 'info', message: 'No remote data file found. A new one will be created.' });
      }

      // Merge logic
      const appMap = new Map<string, Application>();
      const combinedApps = [...applications, ...remoteApps];
      combinedApps.forEach(app => {
        const key = `${app.company}-${app.position}-${app.appliedDate}`;
        if (!appMap.has(key) || new Date(app.id) > new Date(appMap.get(key)!.id)) {
            appMap.set(key, app);
        }
      });
      const mergedApps = Array.from(appMap.values());
      
      setStatus({ type: 'info', message: 'Data merged. Uploading to Google Drive...' });

      if (fileId) {
        await driveService.updateFileContent(fileId, mergedApps);
      } else {
        await driveService.createFile(mergedApps);
      }

      setApplications(mergedApps);
      const now = new Date();
      setLastSync(now.toISOString());
      setStatus({ type: 'success', message: `Sync successful! ${mergedApps.length} total applications.` });

    } catch (error) {
      console.error(error);
      const errorMessage = (error as Error).message || 'An unknown error occurred.';
      setStatus({ type: 'error', message: `Sync failed: ${errorMessage}` });
    } finally {
      setIsSyncing(false);
    }
  };

  const StatusIcon = () => {
    switch (status.type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />;
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />;
      case 'info': default: return <Info className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />;
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800">Google Drive Sync</h3>
      <div className={`mt-4 p-4 rounded-lg flex items-start ${
          status.type === 'success' ? 'bg-green-50' :
          status.type === 'error' ? 'bg-red-50' : 'bg-blue-50'
      }`}>
        <StatusIcon />
        <div>
          <p className={`text-sm font-medium ${
            status.type === 'success' ? 'text-green-800' :
            status.type === 'error' ? 'text-red-800' : 'text-blue-800'
          }`}>{status.message}</p>
          {lastSync && isSignedIn && (
            <p className="text-xs text-gray-500 mt-1">
              Last sync: {new Date(lastSync).toLocaleString()}
            </p>
          )}
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-4">
        {!isSignedIn ? (
          <button
            onClick={handleAuthClick}
            disabled={!isGapiReady || isSyncing}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HardDrive className="-ml-1 mr-2 h-5 w-5" />
            Connect to Google Drive
          </button>
        ) : (
          <>
            <button
              onClick={handleSync}
              disabled={!isGapiReady || isSyncing}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSyncing ? (
                 <RefreshCw className="animate-spin -ml-1 mr-2 h-5 w-5" />
              ) : (
                 <RefreshCw className="-ml-1 mr-2 h-5 w-5" />
              )}
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
            <button
              onClick={handleSignoutClick}
              disabled={!isGapiReady || isSyncing}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
               <LogOut className="-ml-1 mr-2 h-5 w-5" />
              Disconnect
            </button>
          </>
        )}
      </div>
      {!isGapiReady && <p className="text-xs text-gray-500 mt-2">Initializing Google services...</p>}
    </div>
  );
};

// Simple hook to sync state with localStorage, useful for persisting `lastSync` time.
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}


export default GoogleDriveSync;
