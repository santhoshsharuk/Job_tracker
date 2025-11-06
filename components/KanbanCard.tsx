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
      className="bg-white p-3 sm:p-4 rounded-lg shadow-md border border-gray-200 cursor-grab active:cursor-grabbing touch-manipulation"
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm sm:text-base text-gray-800 truncate">{application.position}</h4>
          <p className="text-xs sm:text-sm text-gray-500 flex items-center mt-1">
            <Building className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-gray-400 flex-shrink-0" />
            <span className="truncate">{application.company}</span>
          </p>
        </div>
        <button
          onClick={() => onEdit(application)}
          className="p-1.5 sm:p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          aria-label={`Edit ${application.position}`}
        >
          <Edit className="h-4 w-4" />
        </button>
      </div>
       <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
         <p className="text-xs text-gray-500 flex items-center">
            <Calendar className="h-3 w-3 mr-1 sm:mr-2 text-gray-400 flex-shrink-0" />
            Applied: {new Date(application.appliedDate).toLocaleDateString()}
          </p>
       </div>
    </div>
  );
};

export default KanbanCard;
