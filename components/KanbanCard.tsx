import React from 'react';
import { Application } from '../types';
import { Building, Edit, Calendar } from 'lucide-react';

interface KanbanCardProps {
  application: Application;
  onEdit: (application: Application) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ application, onEdit }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('applicationId', application.id);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="bg-white p-4 rounded-lg shadow-md border border-gray-200 cursor-grab active:cursor-grabbing"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-bold text-gray-800">{application.position}</h4>
          <p className="text-sm text-gray-500 flex items-center mt-1">
            <Building className="h-4 w-4 mr-2 text-gray-400" />
            {application.company}
          </p>
        </div>
        <button
          onClick={() => onEdit(application)}
          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"
          aria-label={`Edit ${application.position}`}
        >
          <Edit className="h-4 w-4" />
        </button>
      </div>
       <div className="mt-3 pt-3 border-t border-gray-100">
         <p className="text-xs text-gray-500 flex items-center">
            <Calendar className="h-3 w-3 mr-2 text-gray-400" />
            Applied: {new Date(application.appliedDate).toLocaleDateString()}
          </p>
       </div>
    </div>
  );
};

export default KanbanCard;
