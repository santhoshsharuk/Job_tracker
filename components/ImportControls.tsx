import React, { useState, useRef } from 'react';
import { Application, Status } from '../types';
import { UploadCloud } from 'lucide-react';

interface ImportControlsProps {
  onImport: (applications: Application[]) => void;
}

const ImportControls: React.FC<ImportControlsProps> = ({ onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'text/csv') {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please select a valid .csv file.');
        setFile(null);
      }
    }
  };

  const parseCSV = (text: string): Application[] => {
    const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) throw new Error("CSV is empty or has only a header.");

    const header = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const requiredHeaders = ['company', 'position', 'appliedDate', 'status'];
    for (const req of requiredHeaders) {
        if (!header.includes(req)) {
            throw new Error(`Missing required header: ${req}`);
        }
    }

    const applications: Application[] = [];
    for (let i = 1; i < lines.length; i++) {
        const data = lines[i].split(','); // simple parse, may need improvement for complex csv
        const appData: any = {};
        header.forEach((h, index) => {
            appData[h] = data[index]?.trim().replace(/"/g, '') || '';
        });

        // Basic validation
        if (appData.company && appData.position && appData.appliedDate && appData.status) {
            applications.push({
                id: `imported-${new Date().toISOString()}-${i}`,
                company: appData.company,
                position: appData.position,
                appliedDate: new Date(appData.appliedDate).toISOString().split('T')[0],
                status: Object.values(Status).includes(appData.status as Status) ? appData.status : Status.APPLIED,
                source: appData.source || '',
                jobLink: appData.jobLink || '',
                notes: appData.notes || '',
                reminderDate: appData.reminderDate || '',
                reminderNote: appData.reminderNote || '',
            });
        }
    }
    return applications;
  };

  const handleImportClick = () => {
    if (!file) {
      setError('Please select a file to import.');
      return;
    }
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const newApps = parseCSV(text);
        onImport(newApps);
        setFile(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
      } catch (err: any) {
        setError(`Failed to parse CSV: ${err.message}`);
      }
    };
    reader.onerror = () => {
        setError('Failed to read the file.');
    }
    reader.readAsText(file);
  };

  return (
    <div>
        <div className="flex items-center gap-4">
            <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
                id="csv-importer"
            />
            <label htmlFor="csv-importer" className="cursor-pointer flex-grow px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors truncate">
                {file ? file.name : 'Choose a .csv file...'}
            </label>
            <button
                onClick={handleImportClick}
                disabled={!file}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <UploadCloud className="-ml-1 mr-2 h-5 w-5" />
                Import
            </button>
        </div>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default ImportControls;
