import React from 'react';
import { Status } from '../types';

interface KanbanColumnProps {
  title: string;
  status: Status;
  color: string;
  children: React.ReactNode;
  onDrop: (e: React.DragEvent<HTMLDivElement>, status: Status) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, status, color, children, onDrop, onDragOver, onDragLeave }) => {
  return (
    <div
      onDrop={(e) => onDrop(e, status)}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className="bg-gray-100 rounded-lg flex flex-col transition-colors"
    >
      <div className={`p-4 rounded-t-lg ${color} text-white font-bold flex justify-between items-center`}>
        {title}
      </div>
      <div className="p-4 space-y-4 overflow-y-auto h-full">
        {children}
      </div>
    </div>
  );
};

export default KanbanColumn;
