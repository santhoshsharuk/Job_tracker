import React from 'react';
import { Application, Status } from '../types';
import KanbanColumn from '../components/KanbanColumn';
import KanbanCard from '../components/KanbanCard';

interface KanbanPageProps {
  applications: Application[];
  onEditApplication: (app: Application) => void;
  onUpdateStatus: (id: string, newStatus: Status) => void;
}

const KanbanPage: React.FC<KanbanPageProps> = ({ applications, onEditApplication, onUpdateStatus }) => {
  const columns: { status: Status, title: string, color: string }[] = [
    { status: Status.APPLIED, title: 'Applied', color: 'bg-blue-500' },
    { status: Status.INTERVIEWING, title: 'Interviewing', color: 'bg-amber-500' },
    { status: Status.OFFER, title: 'Offer', color: 'bg-green-500' },
    { status: Status.REJECTED, title: 'Rejected', color: 'bg-red-500' },
  ];

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: Status) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('applicationId');
    if (appId) {
      onUpdateStatus(appId, newStatus);
    }
    e.currentTarget.classList.remove('bg-gray-200');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-gray-200');
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('bg-gray-200');
  }

  return (
    <div className="p-4 md:p-8 h-full flex flex-col">
      <h1 className="text-3xl font-bold text-gray-800 px-4">Kanban Board</h1>
      <p className="text-gray-500 mt-1 mb-6 px-4">Drag and drop applications to update their status.</p>
      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto">
        {columns.map(col => (
          <KanbanColumn
            key={col.status}
            title={col.title}
            status={col.status}
            color={col.color}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {applications
              .filter(app => app.status === col.status)
              .map(app => (
                <KanbanCard key={app.id} application={app} onEdit={onEditApplication} />
              ))}
          </KanbanColumn>
        ))}
      </div>
    </div>
  );
};

export default KanbanPage;
