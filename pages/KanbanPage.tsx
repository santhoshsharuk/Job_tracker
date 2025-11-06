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

  const columns: { status: Status, title: string, color: string }[] = [
    { status: Status.APPLIED, title: 'Applied', color: 'bg-blue-500' },
    { status: Status.INTERVIEWING, title: 'Interviewing', color: 'bg-amber-500' },
    { status: Status.OFFER, title: 'Offer', color: 'bg-green-500' },
    { status: Status.REJECTED, title: 'Rejected', color: 'bg-red-500' },
  ];

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

  return (
    <>
      <div className="p-4 sm:p-6 md:p-8 h-full flex flex-col">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 px-2 sm:px-4">Kanban Board</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1 mb-4 sm:mb-6 px-2 sm:px-4">Drag and drop applications to update their status.</p>
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
                  <KanbanCard key={app.id} application={app} onEdit={onEditApplication} />
                ))}
            </KanbanColumn>
          ))}
        </div>
      </div>
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
