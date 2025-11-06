import React, { useState, useCallback } from 'react';
import { Application, Page, Status } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import ApplicationForm from './components/ApplicationForm';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import KanbanPage from './pages/KanbanPage';
import SettingsPage from './pages/SettingsPage';

const App: React.FC = () => {
  const [applications, setApplications] = useLocalStorage<Application[]>('jobApplications', []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
