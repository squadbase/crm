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
  currency: string;
  paymentType: string;
  serviceType: string;
  isPaid: boolean;
  salesStartDt: string;
  salesEndDt: string | null;
  description: string | null;
  createdAt: Date;
};

const columns: ColumnDef<OrderData>[] = [
  {
    accessorKey: 'customerName',
    header: '顧客',
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
    header: '説明',
    cell: ({ row }) => (
      <div className="text-body text-foreground max-w-xs truncate">
        {row.original.description}
      </div>
    ),
  },
  {
    accessorKey: 'amount',
    header: '金額',
    cell: ({ row }) => (
      <div className="text-body font-semibold text-foreground">
        {row.original.currency === 'JPY' ? '¥' : row.original.currency}
        {Number(row.original.amount).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: 'paymentType',
    header: '支払い方法',
    cell: ({ row }) => (
      <Badge variant={row.original.paymentType === 'subscription' ? 'accent' : 'secondary'}>
        {row.original.paymentType === 'subscription' ? '継続課金' : '一回払い'}
      </Badge>
    ),
  },
  {
    accessorKey: 'serviceType',
    header: 'サービス',
    cell: ({ row }) => (
      <Badge variant={row.original.serviceType === 'squadbase' ? 'default' : 'secondary'}>
        {row.original.serviceType === 'squadbase' ? 'Squadbase' : 'プロジェクト'}
      </Badge>
    ),
  },
  {
    accessorKey: 'isPaid',
    header: 'ステータス',
    cell: ({ row }) => (
      <StatusBadge status={row.original.isPaid ? '支払い済み' : '未払い'} />
    ),
  },
  {
    accessorKey: 'salesStartDt',
    header: '売上開始日',
    cell: ({ row }) => (
      <div className="text-body text-foreground">
        {new Date(row.original.salesStartDt).toLocaleDateString('ja-JP')}
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
    { id: 'created-desc', label: '作成日（新しい順）', value: 'desc' as const },
    { id: 'created-asc', label: '作成日（古い順）', value: 'asc' as const },
    { id: 'amount-desc', label: '金額（高い順）', value: 'desc' as const },
    { id: 'amount-asc', label: '金額（低い順）', value: 'asc' as const },
  ];

  return (
    <div className="bg-white rounded-card border border-line overflow-hidden">
      <div className="p-6 border-b border-line">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-subheading font-semibold text-foreground">注文一覧</h2>
            <p className="text-body text-muted-foreground mt-1">
              すべての注文を表示・管理できます
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-muted-foreground">
              {filteredData.length}件
            </Badge>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              エクスポート
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              新規注文
            </Button>
          </div>
        </div>
        
        <FilterBar
          placeholder="顧客名や説明で検索..."
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