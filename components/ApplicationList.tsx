
import React from 'react';
import { Application } from '../types';
import ApplicationItem from './ApplicationItem';

interface ApplicationListProps {
  applications: Application[];
  onEdit: (application: Application) => void;
  onDelete: (id: string) => void;
}

const ApplicationList: React.FC<ApplicationListProps> = ({ applications, onEdit, onDelete }) => {
  return (
    <div className="space-y-4">
      {applications.map(app => (
        <ApplicationItem key={app.id} application={app} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default ApplicationList;
