import React, { useState, useMemo, useCallback } from 'react';
import { Application, Status, Filter } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import FilterControls from './components/FilterControls';
import ApplicationList from './components/ApplicationList';
import ApplicationForm from './components/ApplicationForm';
import { generateSummary } from './services/geminiService';
import { PlusCircle } from 'lucide-react';
import UpcomingReminders from './components/UpcomingReminders';

const App: React.FC = () => {
  const [applications, setApplications] = useLocalStorage<Application[]>('jobApplications', []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [filter, setFilter] = useState<Filter>({ search: '', status: 'All' });
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(false);

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

  const handleGenerateSummary = async () => {
    setIsSummaryLoading(true);
    setAiSummary('');
    try {
      const summary = await generateSummary(applications);
      setAiSummary(summary);
    } catch (error) {
      console.error("Failed to generate AI summary:", error);
      setAiSummary("Sorry, I couldn't generate a summary right now. Please try again later.");
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const filteredApplications = useMemo(() => {
    return applications
      .filter(app => {
        const matchesSearch = 
          app.company.toLowerCase().includes(filter.search.toLowerCase()) ||
          app.position.toLowerCase().includes(filter.search.toLowerCase());
        const matchesStatus = filter.status === 'All' || app.status === filter.status;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
  }, [applications, filter]);
  
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header onAddApplication={handleAddApplication} />
      <main className="container mx-auto p-4 md:p-8 space-y-8">
        <Dashboard 
          applications={applications} 
          onGenerateSummary={handleGenerateSummary} 
          summary={aiSummary}
          isSummaryLoading={isSummaryLoading}
        />
        
        <UpcomingReminders 
          applications={applications} 
          onEditApplication={handleEditApplication} 
        />
        
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-gray-700">My Applications</h2>
            <FilterControls filter={filter} setFilter={setFilter} />
          </div>
          {filteredApplications.length > 0 ? (
            <ApplicationList
              applications={filteredApplications}
              onEdit={handleEditApplication}
              onDelete={handleDeleteApplication}
            />
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-500">No applications yet!</h3>
              <p className="text-gray-400 mt-2">Click the button below to add your first job application.</p>
              <button 
                onClick={handleAddApplication} 
                className="mt-4 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Add Application
              </button>
            </div>
          )}
        </div>
      </main>

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