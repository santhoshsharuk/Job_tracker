import React, { useState, useCallback } from 'react';
import { Application, Page, Status } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTutorial } from './hooks/useTutorial';
import Header from './components/Header';
import ApplicationForm from './components/ApplicationForm';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import KanbanPage from './pages/KanbanPage';
import SettingsPage from './pages/SettingsPage';
import InteractiveTutorial from './components/Tutorial';

const App: React.FC = () => {
  const [applications, setApplications] = useLocalStorage<Application[]>('jobApplications', []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { showTutorial, completeTutorial, skipTutorial } = useTutorial();

  const tutorialSteps = [
    {
      target: '[data-tutorial="add-button"]',
      title: 'Welcome to Job Tracker! 🎉',
      description: 'Let me show you around! This interactive tutorial will guide you through the app. This is the Add Application button - you\'ll use it to track new job applications.',
      position: 'bottom' as const,
      waitForAction: false,
    },
    {
      target: '[data-tutorial="add-button"]',
      title: 'Add Your First Application',
      description: 'Click this button to add a new job application. You can add company name, position, status, and more!',
      position: 'bottom' as const,
      action: 'click' as const,
      waitForAction: false,
    },
    {
      target: '[data-tutorial="dashboard-link"]',
      title: 'Dashboard View',
      description: 'The Dashboard shows all your applications in a list view with filters and search. This is where you currently are.',
      position: 'right' as const,
      waitForAction: false,
    },
    {
      target: '[data-tutorial="kanban-link"]',
      title: 'Kanban Board View',
      description: 'Switch to Kanban view to visually manage your applications. Drag cards between columns to update status. Click "Kanban Board" to see it.',
      position: 'right' as const,
      action: 'click' as const,
      waitForAction: true,
    },
    {
      target: '[data-tutorial="settings-link"]',
      title: 'Settings & Configuration',
      description: 'Access Settings to add your AI API key for smart suggestions, import/export data, and customize your experience. Click "Settings".',
      position: 'right' as const,
      action: 'click' as const,
      waitForAction: true,
    },
    {
      target: '[data-tutorial="dashboard-link"]',
      title: 'You\'re All Set! 🚀',
      description: 'Great job! You now know how to navigate Job Tracker. Click "Dashboard" to finish and start tracking your applications!',
      position: 'right' as const,
      action: 'click' as const,
      waitForAction: true,
    },
  ];

  const handleAddApplication = () => {
    setEditingApplication(null);
    setIsFormOpen(true);
  };

  const handleEditApplication = (app: Application) => {
    setEditingApplication(app);
    setIsFormOpen(true);
  };

  const handleDeleteApplication = useCallback((id: string) => {
    setApplications(prev => prev.filter(app => app.id !== id));
  }, [setApplications]);

  const handleSaveApplication = (app: Application) => {
    if (editingApplication) {
      setApplications(prev => prev.map(a => (a.id === app.id ? app : a)));
    } else {
      setApplications(prev => [...prev, { ...app, id: new Date().toISOString() }]);
    }
    setIsFormOpen(false);
    setEditingApplication(null);
  };

  const handleUpdateStatus = useCallback((id: string, newStatus: Status) => {
    setApplications(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
  }, [setApplications]);

  const renderPage = () => {
    switch (currentPage) {
      case 'kanban':
        return <KanbanPage 
                  applications={applications} 
                  onEditApplication={handleEditApplication} 
                  onUpdateStatus={handleUpdateStatus} 
               />;
      case 'settings':
        return <SettingsPage applications={applications} setApplications={setApplications} />;
      case 'dashboard':
      default:
        return <DashboardPage
                  applications={applications}
                  onAddApplication={handleAddApplication}
                  onEditApplication={handleEditApplication}
                  onDeleteApplication={handleDeleteApplication}
                />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      {showTutorial && (
        <InteractiveTutorial
          steps={tutorialSteps}
          onComplete={completeTutorial}
          onSkip={skipTutorial}
        />
      )}

      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={(page) => {
          setCurrentPage(page);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onAddApplication={handleAddApplication}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {renderPage()}
        </main>
      </div>

      {isFormOpen && (
        <ApplicationForm
          application={editingApplication}
          onSave={handleSaveApplication}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
