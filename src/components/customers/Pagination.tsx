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
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px',
      borderTop: '1px solid #e5e7eb'
    }}>
      <p style={{
        fontSize: '13px',
        color: '#6b7280',
        margin: 0
      }}>
        Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} customers
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '6px 10px',
            fontSize: '13px',
            fontWeight: '500',
            color: currentPage === 1 ? '#9ca3af' : '#374151',
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            if (currentPage !== 1) {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== 1) {
              e.currentTarget.style.backgroundColor = 'white';
            }
          }}
        >
          <ChevronLeft style={{ height: '14px', width: '14px', marginRight: '4px' }} />
          Previous
        </button>

        {/* Page numbers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '0 6px' }}>
          {visiblePages.map((page, index) => (
            page === '...' ? (
              <span key={index} style={{
                padding: '6px 10px',
                fontSize: '13px',
                color: '#9ca3af'
              }}>
                ...
              </span>
            ) : (
              <button
                key={index}
                onClick={() => onPageChange(Number(page))}
                style={{
                  padding: '6px 10px',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: currentPage === page ? 'white' : '#374151',
                  backgroundColor: currentPage === page ? '#2563eb' : 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  minWidth: '32px'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== page) {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== page) {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
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
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '6px 10px',
            fontSize: '13px',
            fontWeight: '500',
            color: currentPage === totalPages ? '#9ca3af' : '#374151',
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            if (currentPage !== totalPages) {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== totalPages) {
              e.currentTarget.style.backgroundColor = 'white';
            }
          }}
        >
          Next
          <ChevronRight style={{ height: '14px', width: '14px', marginLeft: '4px' }} />
        </button>
      </div>
    </div>
  );
}