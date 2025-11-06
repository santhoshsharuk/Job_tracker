
import React from 'react';
import { Briefcase, Plus, Menu } from 'lucide-react';

interface HeaderProps {
  onAddApplication: () => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddApplication, onMenuClick }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center">
              <img src="assets/logo.png" alt="Job Tracker Logo" className="h-8 w-8" />
              <h1 className="ml-3 text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">
                Job Tracker
              </h1>
            </div>
          </div>
          <button
            onClick={onAddApplication}
            data-tutorial="add-button"
            className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            <Plus className="h-5 w-5 sm:-ml-1 sm:mr-2" />
            <span className="hidden sm:inline">Add Application</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
