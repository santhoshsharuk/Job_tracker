import React from 'react';
import { Page } from '../types';
import { Briefcase, LayoutDashboard, Columns, Settings } from 'lucide-react';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
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

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
  return (
    <nav className="w-64 bg-gray-800 text-white flex flex-col p-4 flex-shrink-0">
      <div className="flex items-center mb-8 px-2">
        <Briefcase className="h-8 w-8 text-primary-500" />
        <h1 className="ml-3 text-xl font-bold tracking-tight">
          Gemini Job Tracker
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
  );
};

export default Sidebar;