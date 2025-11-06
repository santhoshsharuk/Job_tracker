import React, { useState, useRef, useEffect } from 'react';
import { Application } from '../types';
import { exportToCSV, exportToPDF } from '../utils/export';
import { ChevronDown, FileText, DownloadCloud } from 'lucide-react';

interface ExportControlsProps {
  applications: Application[];
  disabled: boolean;
}

const ExportControls: React.FC<ExportControlsProps> = ({ applications, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportCSV = () => {
    exportToCSV(applications);
    setIsOpen(false);
  };

  const handleExportPDF = () => {
    exportToPDF(applications);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <DownloadCloud className="-ml-1 mr-2 h-5 w-5" />
          Export
          <ChevronDown className="-mr-1 ml-2 h-5 w-5" />
        </button>
      </div>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1" role="none">
            <button
              onClick={handleExportCSV}
              className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
            >
              <FileText className="mr-3 h-5 w-5 text-gray-400" />
              <span>Export as CSV</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
            >
               <FileText className="mr-3 h-5 w-5 text-gray-400" />
              <span>Export as PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportControls;
