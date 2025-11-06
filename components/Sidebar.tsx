import React from 'react';
import { Page } from '../types';
import { Briefcase, LayoutDashboard, Columns, Settings, X } from 'lucide-react';

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
}> = ({ page, currentPage, setCurrentPage, icon, text }) => {
  const isActive = currentPage === page;
  return (
    <button
      onClick={() => setCurrentPage(page)}
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
      <nav className={`
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
          />
          <NavLink
            page="kanban"
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            icon={<Columns className="h-5 w-5" />}
            text="Kanban Board"
          />
          <NavLink
            page="settings"
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            icon={<Settings className="h-5 w-5" />}
            text="Settings"
          />
        </div>
      </nav>
    </>
  );
};

export default Sidebar;