import React from 'react';
import { Filter, Status } from '../types';
import { Search } from 'lucide-react';

interface FilterControlsProps {
  filter: Filter;
  setFilter: React.Dispatch<React.SetStateAction<Filter>>;
}

const FilterControls: React.FC<FilterControlsProps> = ({ filter, setFilter }) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(prev => ({ ...prev, search: e.target.value }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(prev => ({ ...prev, status: e.target.value as Status | 'All' }));
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
      <div className="relative flex-grow">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          value={filter.search}
          onChange={handleSearchChange}
          placeholder="Search by company or position..."
          className="block w-full rounded-lg border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 sm:text-sm transition-colors"
        />
      </div>
      <div className="flex-shrink-0">
        <select
          value={filter.status}
          onChange={handleStatusChange}
          className="block w-full rounded-lg border-gray-200 bg-gray-50 py-2.5 pl-3 pr-10 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 sm:text-sm transition-colors"
        >
          <option value="All">All Statuses</option>
          {Object.values(Status).map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterControls;