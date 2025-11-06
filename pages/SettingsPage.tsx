import React, { useState } from 'react';
import { Application } from '../types';
import ExportControls from '../components/ExportControls';
import ImportControls from '../components/ImportControls';
import GoogleDriveSync from '../components/GoogleDriveSync';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface SettingsPageProps {
  applications: Application[];
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ applications, setApplications }) => {
  const [geminiApiKey, setGeminiApiKey] = useLocalStorage<string>('gemini_api_key', '');
  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

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
    </div>
  );
};

export default SettingsPage;