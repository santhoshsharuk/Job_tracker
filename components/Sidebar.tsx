import React from 'react';
import { Page } from '../types';
import { Briefcase, LayoutDashboard, Columns, Settings, X, Search, Download, CheckCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  isOpen: boolean;
  onClose: () => void;
}

const NavLink: React.FC<{
  page: Page;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  icon: React.ReactNode;
  text: string;
  dataTutorial?: string;
}> = ({ page, currentPage, setCurrentPage, icon, text, dataTutorial }) => {
  const isActive = currentPage === page;
  return (
    <button
      onClick={() => setCurrentPage(page)}
      data-tutorial={dataTutorial}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-primary-700 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      {icon}
      <span className="ml-3">{text}</span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isOpen, onClose }) => {
  const { isInstallable, isInstalled, installApp } = usePWAInstall();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <nav data-tutorial="sidebar" className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gray-800 text-white flex flex-col p-4 flex-shrink-0
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex items-center mb-8 px-2">
          <img src="assets/logo.png" alt="Job Tracker Logo" className="h-8 w-8" />
          <h1 className="ml-3 text-xl font-bold tracking-tight">
            Job Tracker
          </h1>
        </div>
        <div className="space-y-2">
          <NavLink
            page="dashboard"
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            icon={<LayoutDashboard className="h-5 w-5" />}
            text="Dashboard"
            dataTutorial="dashboard-link"
          />
          <NavLink
            page="kanban"
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            icon={<Columns className="h-5 w-5" />}
            text="Kanban Board"
            dataTutorial="kanban-link"
          />
          <NavLink
            page="jobfinder"
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            icon={<Search className="h-5 w-5" />}
            text="Job Finder"
            dataTutorial="jobfinder-link"
          />
          <NavLink
            page="settings"
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            icon={<Settings className="h-5 w-5" />}
            text="Settings"
            dataTutorial="settings-link"
          />
        </div>

        {/* PWA Install Button */}
        <div className="mt-auto pt-4 border-t border-gray-700">
          {isInstallable && !isInstalled && (
            <button
              onClick={installApp}
              className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Download className="h-5 w-5 mr-2 animate-bounce" />
              <div className="text-left flex-1">
                <div className="font-semibold">Install App</div>
                <div className="text-xs opacity-90">One-tap access</div>
              </div>
            </button>
          )}
          
          {isInstalled && (
            <div className="flex items-center justify-center w-full px-4 py-3 text-sm bg-green-600 bg-opacity-20 text-green-400 rounded-lg border border-green-600 border-opacity-30">
              <CheckCircle className="h-5 w-5 mr-2" />
              <div className="text-left flex-1">
                <div className="font-semibold">App Installed</div>
                <div className="text-xs opacity-80">Ready to use</div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;