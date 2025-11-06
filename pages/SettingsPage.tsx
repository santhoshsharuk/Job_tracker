import React from 'react';
import { Application } from '../types';
import ExportControls from '../components/ExportControls';
import ImportControls from '../components/ImportControls';
import GoogleDriveSync from '../components/GoogleDriveSync';

interface SettingsPageProps {
  applications: Application[];
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ applications, setApplications }) => {
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

  return (
    <div className="p-4 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-3">Data Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Export Data</h3>
            <p className="text-sm text-gray-500 mb-4">Download all your applications as a CSV or PDF file.</p>
            <ExportControls applications={applications} disabled={applications.length === 0} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Import Data</h3>
            <p className="text-sm text-gray-500 mb-4">Import applications from a CSV file. Make sure the headers match: `company`, `position`, `appliedDate`, `status`, etc.</p>
            <ImportControls onImport={handleImport} />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-3">Cloud Sync</h2>
        <GoogleDriveSync applications={applications} setApplications={setApplications} />
      </div>
    </div>
  );
};

export default SettingsPage;