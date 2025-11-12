import React, { useState } from 'react';
import { Application } from '../types';
import ExportControls from '../components/ExportControls';
import ImportControls from '../components/ImportControls';
import GoogleDriveSync from '../components/GoogleDriveSync';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { HelpCircle, Bell, BellOff } from 'lucide-react';
import { NotificationService } from '../services/notificationService';

interface SettingsPageProps {
  applications: Application[];
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ applications, setApplications }) => {
  const [geminiApiKey, setGeminiApiKey] = useLocalStorage<string>('gemini_api_key', '');
  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [notificationStatus, setNotificationStatus] = useState(
    NotificationService.getPermissionStatus()
  );

  const handleImport = (newApplications: Application[]) => {
    // Basic de-duplication based on a composite key
    const existingKeys = new Set(applications.map(app => `${app.company}-${app.position}-${app.appliedDate}`));
    const uniqueNewApps = newApplications.filter(newApp => {
      const key = `${newApp.company}-${newApp.position}-${newApp.appliedDate}`;
      return !existingKeys.has(key);
    });

    setApplications(prev => [...prev, ...uniqueNewApps]);
    alert(`${uniqueNewApps.length} new applications imported successfully!`);
  };

  const handleSaveApiKey = () => {
    setGeminiApiKey(apiKeyInput);
    setSaveMessage('API key saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleClearApiKey = () => {
    setApiKeyInput('');
    setGeminiApiKey('');
    setSaveMessage('API key cleared!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleRestartTutorial = () => {
    localStorage.removeItem('jobTracker_tutorialCompleted');
    window.location.reload();
  };

  const handleRequestNotifications = async () => {
    const permission = await NotificationService.requestPermission();
    setNotificationStatus(NotificationService.getPermissionStatus());
    
    if (permission === 'granted') {
      await NotificationService.showNotification(
        '🎉 Notifications Enabled!',
        {
          body: 'You will now receive reminders for your job applications.',
        }
      );
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Settings</h1>
      
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
        <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-4 border-b pb-3">API Configuration</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Gemini API Key</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-4">
              Enter your personal Gemini API key to enable AI-powered features. 
              Get your API key from{' '}
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google AI Studio
              </a>
            </p>
            <div className="flex flex-col gap-3">
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Enter your Gemini API key"
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-20 sm:pr-24"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs sm:text-sm text-gray-600 hover:text-gray-800"
                >
                  {showApiKey ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleSaveApiKey}
                  className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save API Key
                </button>
                <button
                  onClick={handleClearApiKey}
                  className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Clear
                </button>
              </div>
              {saveMessage && (
                <p className="text-xs sm:text-sm text-green-600 font-medium">{saveMessage}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
        <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-4 border-b pb-3">Data Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mt-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Export Data</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-4">Download all your applications as a CSV or PDF file.</p>
            <ExportControls applications={applications} disabled={applications.length === 0} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Import Data</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-4">Import applications from a CSV file. Make sure the headers match: `company`, `position`, `appliedDate`, `status`, etc.</p>
            <ImportControls onImport={handleImport} />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
        <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-4 border-b pb-3">Cloud Sync</h2>
        <GoogleDriveSync applications={applications} setApplications={setApplications} />
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
        <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-4 border-b pb-3">Notifications</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
              {notificationStatus.granted ? (
                <Bell className="h-5 w-5 text-green-600" />
              ) : (
                <BellOff className="h-5 w-5 text-gray-400" />
              )}
              Push Notifications
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-4 mt-2">
              {notificationStatus.granted ? (
                'Notifications are enabled. You will receive reminders for your job applications.'
              ) : notificationStatus.denied ? (
                'Notifications are blocked. Please enable them in your browser settings to receive reminders.'
              ) : (
                'Enable notifications to receive timely reminders for your job applications.'
              )}
            </p>
            {!notificationStatus.granted && !notificationStatus.denied && (
              <button
                onClick={handleRequestNotifications}
                className="w-full sm:w-auto px-6 py-2 text-sm sm:text-base bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                Enable Notifications
              </button>
            )}
            {notificationStatus.granted && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Notifications Active
              </div>
            )}
            {notificationStatus.denied && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs sm:text-sm text-yellow-800">
                  <strong>How to enable:</strong> Click the lock icon in your browser's address bar, then allow notifications for this site.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
        <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-4 border-b pb-3">Help & Support</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary-600" />
              Getting Started
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-4 mt-2">
              Need help? Restart the interactive tutorial to learn how to use Job Tracker.
            </p>
            <button
              onClick={handleRestartTutorial}
              className="w-full sm:w-auto px-6 py-2 text-sm sm:text-base bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Restart Tutorial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;