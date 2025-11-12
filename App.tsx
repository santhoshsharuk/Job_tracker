import React, { useState, useCallback } from 'react';
import { Application, Page, Status } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTutorial } from './hooks/useTutorial';
import { useNotifications } from './hooks/useNotifications';
import Header from './components/Header';
import ApplicationForm from './components/ApplicationForm';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import KanbanPage from './pages/KanbanPage';
import SettingsPage from './pages/SettingsPage';
import JobFinderPage from './pages/JobFinderPage';
import InteractiveTutorial from './components/Tutorial';

const App: React.FC = () => {
  const [applications, setApplications] = useLocalStorage<Application[]>('jobApplications', []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { showTutorial, completeTutorial, skipTutorial } = useTutorial();
  const [tutorialStep, setTutorialStep] = useState(0);
  const { requestNotificationPermission, checkAndScheduleReminders } = useNotifications(applications);

  // Open sidebar on mobile when tutorial reaches navigation steps
  React.useEffect(() => {
    if (showTutorial && window.innerWidth < 1024) {
      // Steps 2, 3, 4, 5 are navigation-related
      if (tutorialStep >= 2 && tutorialStep <= 5) {
        setIsSidebarOpen(true);
      }
    }
  }, [showTutorial, tutorialStep]);

  const tutorialSteps = [
    {
      target: '[data-tutorial="add-button"]',
      title: 'Welcome to Job Tracker! 🎉',
      description: 'This interactive tutorial will guide you through the app. This is the Add Application button - tap it to track new job applications.',
      position: 'bottom' as const,
      waitForAction: false,
    },
    {
      target: '[data-tutorial="add-button"]',
      title: 'Add Your First Application',
      description: 'Tap this button to add a new job application with company name, position, status, salary, and important dates.',
      position: 'bottom' as const,
      action: 'click' as const,
      waitForAction: false,
    },
    {
      target: '[data-tutorial="dashboard-link"]',
      title: 'Dashboard View',
      description: 'The Dashboard displays all applications in a list with filters, search, and sorting options.',
      position: 'right' as const,
      waitForAction: false,
    },
    {
      target: '[data-tutorial="kanban-link"]',
      title: 'Kanban Board View',
      description: 'Kanban view lets you visually manage applications by status. On desktop, drag cards. On mobile, tap to change status. Try it now!',
      position: 'right' as const,
      action: 'click' as const,
      waitForAction: true,
    },
    {
      target: '[data-tutorial="settings-link"]',
      title: 'Settings & Options',
      description: 'Settings lets you configure AI API keys, import/export data, sync with Google Drive, and manage preferences. Take a look!',
      position: 'right' as const,
      action: 'click' as const,
      waitForAction: true,
    },
    {
      target: '[data-tutorial="dashboard-link"]',
      title: 'You\'re All Set! 🚀',
      description: 'Perfect! You now know all the key features. Tap "Dashboard" to return and start tracking your job applications!',
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
    
    // Re-check and schedule reminders after saving
    setTimeout(() => checkAndScheduleReminders(), 100);
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
      case 'jobfinder':
        return <JobFinderPage />;
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
          onStepChange={setTutorialStep}
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
