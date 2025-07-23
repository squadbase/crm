"use client";

import { useVirtualizer } from '@tanstack/react-virtual';
import { 
  useReactTable, 
  getCoreRowModel, 
  flexRender, 
  type ColumnDef 
} from '@tanstack/react-table';
import { useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  className?: string;
}

export function DataTable<TData>({ 
  columns, 
  data, 
  className = "" 
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { rows } = table.getRowModel();
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 68,
    overscan: 5,
  });

  return (
    <div className={`rounded-lg border border-gray-200 bg-white overflow-hidden ${className}`}>
      <div
        ref={parentRef}
        className="relative overflow-auto h-[600px]"
      >
        <div
          className="relative w-full"
          style={{
            height: `${virtualizer.getTotalSize()}px`,
          }}
        >
          <table className="w-full caption-bottom text-sm">
            <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
              {table.getHeaderGroups().map((headerGroup, groupIndex) => (
                <tr key={`header-group-${headerGroup.id}-${groupIndex}`}>
                  {headerGroup.headers.map((header, headerIndex) => (
                    <th
                      key={`header-${header.id}-${headerIndex}`}
                      className="h-12 px-4 text-left align-middle font-semibold text-gray-900 text-xs [&:has([role=checkbox])]:pr-0"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())
                      }
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
          </table>
          
          {virtualizer.getVirtualItems().map((virtualRow, virtualIndex) => {
            const row = rows[virtualRow.index];
            return (
              <div
                key={`virtual-row-${row.id}-${virtualIndex}`}
                className="absolute w-full"
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <table className="w-full caption-bottom text-sm">
                  <tbody className="bg-white [&_tr:last-child]:border-0">
                    <tr className="border-b border-gray-100 transition-colors hover:bg-gray-50/50 data-[state=selected]:bg-blue-50/50">
                      {row.getVisibleCells().map((cell, cellIndex) => (
                        <td
                          key={`cell-${cell.id}-${cellIndex}`}
                          className="px-4 py-3 align-middle text-gray-900 [&:has([role=checkbox])]:pr-0"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Status Badge Component
interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'accent' | 'outline';
}

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case '支払い済み':
      case 'Paid':
      case 'Complete':
      case '完了':
        return { variant: 'success' as const, icon: CheckCircle };
      case '未払い':
      case 'Unpaid':
      case 'Pending':
      case '保留':
        return { variant: 'warning' as const, icon: Clock };
      case 'Failed':
      case 'Error':
      case 'エラー':
        return { variant: 'danger' as const, icon: XCircle };
      case 'Processing':
      case '処理中':
        return { variant: 'accent' as const, icon: AlertTriangle };
      default:
        return { variant: variant || 'secondary' as const, icon: null };
    }
  };

  const { variant: statusVariant, icon: Icon } = getStatusConfig(status);
  
  return (
    <Badge variant={statusVariant} className="flex items-center gap-1.5">
      {Icon && <Icon className="h-3 w-3" />}
      {status}
    </Badge>
  );
}