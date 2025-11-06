
import React from 'react';
import { Briefcase, Plus } from 'lucide-react';

interface HeaderProps {
  onAddApplication: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddApplication }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <img src="assets/logo.png" alt="Job Tracker Logo" className="h-8 w-8" />
            <h1 className="ml-3 text-2xl font-bold text-gray-800 tracking-tight">
              Job Tracker
            </h1>
          </div>
          <button
            onClick={onAddApplication}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Add Application
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
