import React from 'react';
import { Status } from '../types';

interface KanbanColumnProps {
  title: string;
  status: Status;
  color: string;
  children: React.ReactNode;
  isDragTarget: boolean;
  onDrop: (e: React.DragEvent<HTMLDivElement>, status: Status) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, status: Status) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  status,
  color,
  children,
  isDragTarget,
  onDrop,
  onDragOver,
  onDragLeave
}) => {
  return (
    <div
      onDrop={(e) => onDrop(e, status)}
      onDragOver={(e) => onDragOver(e, status)}
      onDragLeave={onDragLeave}
      className={`rounded-lg flex flex-col transition-all duration-200 ease-in-out ${
        isDragTarget ? 'bg-primary-100 ring-2 ring-primary-500 ring-offset-2' : 'bg-gray-100'
      }`}
    >
      <div className={`p-4 rounded-t-lg ${color} text-white font-bold flex justify-between items-center`}>
        {title}
        <span className="text-sm font-normal bg-white/20 rounded-full px-2 py-0.5">{React.Children.count(children)}</span>
      </div>
      <div className="p-4 space-y-4 overflow-y-auto h-full">
        {React.Children.count(children) > 0 ? (
          children
        ) : (
          <div className="flex items-center justify-center h-full text-center text-gray-400 text-sm border-2 border-dashed border-gray-300 rounded-lg p-4">
            Drag cards here
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
