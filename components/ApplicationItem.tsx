import React from 'react';
import { Application, Status } from '../types';
import { Building, Briefcase, Calendar, Link as LinkIcon, Edit, Trash2, Bell, FileText, Clock } from 'lucide-react';

interface ApplicationItemProps {
  application: Application;
  onEdit: (application: Application) => void;
  onDelete: (id: string) => void;
}

const statusColors: Record<Status, string> = {
  [Status.APPLIED]: 'bg-blue-100 text-blue-800',
  [Status.INTERVIEWING]: 'bg-amber-100 text-amber-800',
  [Status.OFFER]: 'bg-green-100 text-green-800',
  [Status.REJECTED]: 'bg-red-100 text-red-800',
};

const ApplicationItem: React.FC<ApplicationItemProps> = ({ application, onEdit, onDelete }) => {

  const needsFollowUp = () => {
    if (application.status !== Status.APPLIED) return false;
    const appliedDate = new Date(application.appliedDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - appliedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 7;
  };

  const reminderDate = application.reminderDate ? new Date(application.reminderDate + 'T00:00:00') : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdue = reminderDate && reminderDate < today;

  return (
    <div className="border border-gray-200 bg-white rounded-lg p-4 transition-shadow hover:shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-4">
             <h3 className="text-lg font-bold text-primary-700">{application.position}</h3>
             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[application.status]}`}>
                {application.status}
             </span>
          </div>
          <p className="text-md text-gray-600 flex items-center mt-1">
            <Building className="h-4 w-4 mr-2 text-gray-400" />
            {application.company}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <button onClick={() => onEdit(application)} className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"><Edit className="h-5 w-5" /></button>
          <button onClick={() => onDelete(application.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors"><Trash2 className="h-5 w-5" /></button>
        </div>
      </div>
      
      <div className="mt-4 border-t border-gray-100 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div className="flex items-center text-gray-500">
            <Calendar className="h-4 w-4 mr-2" />
            Applied on: <span className="font-medium text-gray-700 ml-1">{new Date(application.appliedDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center text-gray-500">
            <LinkIcon className="h-4 w-4 mr-2" />
            Source: <a href={application.jobLink} target="_blank" rel="noopener noreferrer" className="font-medium text-primary-600 hover:underline ml-1 truncate">{application.source || 'N/A'}</a>
          </div>
           {application.reminderDate && (
             <div className={`flex items-start text-gray-500 ${isOverdue ? 'text-red-600' : ''}`}>
               <Clock className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
               <div>
                 Reminder: <span className="font-medium text-gray-700 ml-1">{new Date(application.reminderDate + 'T00:00:00').toLocaleDateString()}</span>
                 {application.reminderNote && <p className="text-xs text-gray-600 italic mt-1">{application.reminderNote}</p>}
               </div>
             </div>
           )}
          {application.notes && (
            <div className="flex items-start text-gray-500">
              <FileText className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <div>Notes: <p className="font-medium text-gray-700 inline">{application.notes}</p></div>
            </div>
          )}
        </div>
        {needsFollowUp() && (
            <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-md flex items-center text-sm">
              <Bell className="h-5 w-5 mr-2 text-yellow-500"/>
              It's been over a week. Consider sending a follow-up email.
            </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationItem;