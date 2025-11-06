import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ currentPage, totalPages, onPageChange }) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 sm:mt-6 border-t border-gray-200 pt-4 gap-3">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
        Previous
      </button>
      <div className="order-first sm:order-none">
        <p className="text-xs sm:text-sm text-gray-700 text-center">
          Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
        </p>
      </div>
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 ml-1" />
      </button>
    </div>
  );
};

export default PaginationControls;