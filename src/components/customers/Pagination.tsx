'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, totalCount, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-between p-4 border-t border-gray-200">
      <p className="text-xs text-gray-500 m-0">
        Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} customers
      </p>

      <div className="flex items-center gap-1">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center px-2.5 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded-md transition-colors ${
            currentPage === 1 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-gray-700 cursor-pointer hover:bg-gray-50'
          }`}
        >
          <ChevronLeft className="h-3.5 w-3.5 mr-1" />
          Previous
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1 mx-1.5">
          {visiblePages.map((page, index) => (
            page === '...' ? (
              <span key={`dots-${index}`} className="px-2.5 py-1.5 text-xs text-gray-400">
                ...
              </span>
            ) : (
              <button
                key={`page-${page}-${index}`}
                onClick={() => onPageChange(Number(page))}
                className={`px-2.5 py-1.5 text-xs font-medium border border-gray-300 rounded-md cursor-pointer transition-colors min-w-[32px] ${
                  currentPage === page 
                    ? 'text-white bg-blue-600' 
                    : 'text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            )
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center px-2.5 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded-md transition-colors ${
            currentPage === totalPages 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-gray-700 cursor-pointer hover:bg-gray-50'
          }`}
        >
          Next
          <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </button>
      </div>
    </div>
  );
}