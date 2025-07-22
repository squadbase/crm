"use client";

import { Badge } from '@/components/ui/badge';
import { DataTable, StatusBadge } from '@/components/ui/data-table';
import { FilterBar } from '@/components/ui/filter-bar';
import { Button } from '@/components/ui/button';
import { type ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import Link from 'next/link';
import { Download, Plus, Eye } from 'lucide-react';

type OrderData = {
  orderId: string;
  customerName: string | null;
  customerId: string | null;
  amount: string;
  isPaid: boolean;
  salesAt: Date;
  description: string | null;
  createdAt: Date;
};

const columns: ColumnDef<OrderData>[] = [
  {
    accessorKey: 'customerName',
    header: 'Customer',
    cell: ({ row }) => (
      <Link
        href={`/customers/${row.original.customerId}`}
        className="text-primary hover:text-primary/80 font-medium transition-colors"
      >
        {row.original.customerName}
      </Link>
    ),
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => (
      <div className="text-body text-foreground max-w-xs truncate">
        {row.original.description}
      </div>
    ),
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => (
      <div className="text-body font-semibold text-foreground">
        ¥{Number(row.original.amount).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: 'isPaid',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge status={row.original.isPaid ? 'Paid' : 'Unpaid'} />
    ),
  },
  {
    accessorKey: 'salesAt',
    header: 'Sales Date',
    cell: ({ row }) => (
      <div className="text-body text-foreground">
        {(() => {
          const date = row.original.salesAt;
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}/${month}/${day}`;
        })()}
      </div>
    ),
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/orders/${row.original.orderId}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    ),
  },
];

interface OrdersTableProps {
  data: OrderData[];
}

export function OrdersTable({ data }: OrdersTableProps) {
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState<{id: string; label: string; value: string}[]>([]);

  const filteredData = data.filter(order => 
    order.customerName?.toLowerCase().includes(searchValue.toLowerCase()) ||
    order.description?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const sortOptions = [
    { id: 'created-desc', label: 'Created Date (Newest)', value: 'desc' as const },
    { id: 'created-asc', label: 'Created Date (Oldest)', value: 'asc' as const },
    { id: 'amount-desc', label: 'Amount (Highest)', value: 'desc' as const },
    { id: 'amount-asc', label: 'Amount (Lowest)', value: 'asc' as const },
  ];

  return (
    <div className="bg-white rounded-card border border-line overflow-hidden">
      <div className="p-6 border-b border-line">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-subheading font-semibold text-foreground">Orders List</h2>
            <p className="text-body text-muted-foreground mt-1">
              View and manage all orders
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-muted-foreground">
              {filteredData.length} items
            </Badge>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </div>
        </div>
        
        <FilterBar
          placeholder="Search by customer name or description..."
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          filters={filters}
          onFilterRemove={(id) => setFilters(filters.filter(f => f.id !== id))}
          onFiltersClear={() => setFilters([])}
          sortOptions={sortOptions}
        />
      </div>
      
      <div className="p-6">
        <DataTable columns={columns} data={filteredData} />
      </div>
    </div>
  );
}