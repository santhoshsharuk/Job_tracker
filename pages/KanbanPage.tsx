import React, { useState } from 'react';
import { Application, Status } from '../types';
import KanbanColumn from '../components/KanbanColumn';
import KanbanCard from '../components/KanbanCard';
import ConfirmationModal from '../components/ConfirmationModal';

interface KanbanPageProps {
  applications: Application[];
  onEditApplication: (app: Application) => void;
  onUpdateStatus: (id: string, newStatus: Status) => void;
}

const KanbanPage: React.FC<KanbanPageProps> = ({ applications, onEditApplication, onUpdateStatus }) => {
  const [dragOverStatus, setDragOverStatus] = useState<Status | null>(null);
  const [pendingUpdate, setPendingUpdate] = useState<{ app: Application; newStatus: Status } | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);

  const columns: { status: Status, title: string, color: string }[] = [
    { status: Status.APPLIED, title: 'Applied', color: 'bg-blue-500' },
    { status: Status.INTERVIEWING, title: 'Interviewing', color: 'bg-amber-500' },
    { status: Status.OFFER, title: 'Offer', color: 'bg-green-500' },
    { status: Status.REJECTED, title: 'Rejected', color: 'bg-red-500' },
  ];

  // Detect if mobile view
  React.useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: Status) => {
    e.preventDefault();
    setDragOverStatus(null);
    const appId = e.dataTransfer.getData('applicationId');
    const app = applications.find(a => a.id === appId);
    if (app && app.status !== newStatus) {
      setPendingUpdate({ app, newStatus });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, status: Status) => {
    e.preventDefault();
    // Prevent default to allow drop
    e.dataTransfer.dropEffect = "move";
    setDragOverStatus(status);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    setDragOverStatus(null);
  }

  const handleConfirmUpdate = () => {
    if (pendingUpdate) {
      onUpdateStatus(pendingUpdate.app.id, pendingUpdate.newStatus);
      setPendingUpdate(null);
    }
  };

  const handleCancelUpdate = () => {
    setPendingUpdate(null);
  };

  const handleCardClick = (app: Application) => {
    if (isMobileView) {
      setSelectedApp(app);
    }
  };

  const handleStatusChange = (newStatus: Status) => {
    if (selectedApp && selectedApp.status !== newStatus) {
      setPendingUpdate({ app: selectedApp, newStatus });
      setSelectedApp(null);
    } else {
      setSelectedApp(null);
    }
  };

  return (
    <>
      <div className="p-4 sm:p-6 md:p-8 h-full flex flex-col">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 px-2 sm:px-4">Kanban Board</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1 mb-4 sm:mb-6 px-2 sm:px-4">
          {isMobileView ? 'Tap a card to change its status.' : 'Drag and drop applications to update their status.'}
        </p>
        <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto">
          {columns.map(col => (
            <KanbanColumn
              key={col.status}
              title={col.title}
              status={col.status}
              color={col.color}
              isDragTarget={dragOverStatus === col.status}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {applications
                .filter(app => app.status === col.status)
                .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
                .map(app => (
                  <KanbanCard 
                    key={app.id} 
                    application={app} 
                    onEdit={onEditApplication}
                    onClick={() => handleCardClick(app)}
                    isMobile={isMobileView}
                  />
                ))}
            </KanbanColumn>
          ))}
        </div>
      </div>
      
      {/* Mobile Status Change Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center lg:hidden">
          <div className="bg-white rounded-t-2xl w-full max-w-lg animate-slide-up">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">{selectedApp.position}</h3>
                  <p className="text-sm text-gray-600">{selectedApp.company}</p>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>
              
              <p className="text-sm text-gray-700 mb-4">Change status to:</p>
              
              <div className="space-y-2">
                {columns.map(col => (
                  <button
                    key={col.status}
                    onClick={() => handleStatusChange(col.status)}
                    disabled={selectedApp.status === col.status}
                    className={`w-full p-4 rounded-lg text-left font-medium transition-all ${
                      selectedApp.status === col.status
                        ? `${col.color} text-white cursor-default`
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200 active:scale-95'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{col.title}</span>
                      {selectedApp.status === col.status && (
                        <span className="text-sm opacity-75">(Current)</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setSelectedApp(null)}
                className="w-full mt-4 p-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!pendingUpdate}
        title="Confirm Status Change"
        message={`Are you sure you want to move "${pendingUpdate?.app.position} at ${pendingUpdate?.app.company}" to the "${pendingUpdate?.newStatus}" column?`}
        onConfirm={handleConfirmUpdate}
        onCancel={handleCancelUpdate}
        confirmText="Confirm Move"
      />
    </>
  );
};

export default KanbanPage;
