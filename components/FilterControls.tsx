import React from 'react';
import { Filter, Status } from '../types';
import { Search } from 'lucide-react';

interface FilterControlsProps {
  filter: Filter;
  setFilter: React.Dispatch<React.SetStateAction<Filter>>;
}

const FilterControls: React.FC<FilterControlsProps> = ({ filter, setFilter }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilter({
      search: '',
      status: 'All',
      startDate: '',
      endDate: '',
    });
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
        {/* Search Input */}
        <div className="sm:col-span-2 md:col-span-3 lg:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                    type="text"
                    id="search"
                    name="search"
                    value={filter.search}
                    onChange={handleChange}
                    placeholder="Company, position, notes..."
                    className="block w-full rounded-md border-gray-300 bg-white py-2 pl-10 pr-3 text-gray-900 placeholder-gray-500 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm transition-colors"
                />
            </div>
        </div>
        
        {/* Status Select */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            id="status"
            name="status"
            value={filter.status}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 bg-white py-2 pl-3 pr-10 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm transition-colors"
          >
            <option value="All">All Statuses</option>
            {Object.values(Status).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        
        {/* Date Range */}
        <div className="grid grid-cols-2 gap-2">
            <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <input
                    type="date"
                    name="startDate"
                    id="startDate"
                    value={filter.startDate}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 bg-white py-2 px-3 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm transition-colors"
                />
            </div>
            <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input
                    type="date"
                    name="endDate"
                    id="endDate"
                    value={filter.endDate}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 bg-white py-2 px-3 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm transition-colors"
                />
            </div>
        </div>

        {/* Reset Button */}
        <div>
            <button
                type="button"
                onClick={resetFilters}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
                Reset
            </button>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;