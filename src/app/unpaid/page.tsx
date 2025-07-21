'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useClientI18n } from '@/hooks/useClientI18n';
import { Receipt, Check, AlertCircle } from 'lucide-react';

interface UnpaidPayment {
  id: string;
  type: 'onetime' | 'subscription';
  customerName: string;
  amount: string;
  description: string;
  salesDate: string;
  dueDate: string;
  isPaid: boolean;
  serviceType: string;
  paymentType: string;
  createdAt: string;
  subscriptionId?: string;
  year?: number;
  month?: number;
}

interface UnpaidPaymentsResponse {
  unpaidPayments: UnpaidPayment[];
  totalCount: number;
  totalAmount: number;
  currentMonthStart: string;
}

export default function UnpaidPaymentsPage() {
  const { t, formatCurrency } = useClientI18n();
  
  // ページタイトル設定
  useEffect(() => {
    document.title = t('unpaidPaymentsTitle');
  }, [t]);

  const [unpaidPayments, setUnpaidPayments] = useState<UnpaidPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [updating, setUpdating] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  // 未払い取引を取得
  const fetchUnpaidPayments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/unpaid');
      const data: UnpaidPaymentsResponse = await response.json();
      
      setUnpaidPayments(data.unpaidPayments);
      setTotalAmount(data.totalAmount);
    } catch (error) {
      console.error('Failed to fetch unpaid payments:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初期データ取得
  useEffect(() => {
    fetchUnpaidPayments();
  }, []);

  // 個別選択のトグル
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  // 全選択・全解除のトグル
  const toggleSelectAll = () => {
    if (!unpaidPayments) return;
    
    if (selectedItems.size === unpaidPayments.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(unpaidPayments.map(p => p.id)));
    }
  };

  // 支払い済みにマーク
  const markAsPaid = async () => {
    if (selectedItems.size === 0) return;

    setUpdating(true);
    try {
      const items = Array.from(selectedItems).map(id => {
        const payment = unpaidPayments.find(p => p.id === id);
        if (!payment) return null;

        return {
          id: payment.id,
          type: payment.type,
          subscriptionId: payment.subscriptionId,
          year: payment.year,
          month: payment.month
        };
      }).filter(item => item !== null);

      const response = await fetch('/api/unpaid/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });

      const result = await response.json();
      
      if (result.success) {
        // 成功時：データを再取得して選択をクリア
        await fetchUnpaidPayments();
        setSelectedItems(new Set());
        // サイレント更新（アラート削除）
      } else {
        console.error('Payment update failed:', result);
      }
    } catch (error) {
      console.error('Failed to update payment status:', error);
      // エラーもサイレント処理（アラート削除）
    } finally {
      setUpdating(false);
    }
  };

  // 期限経過日数を計算
  const getDaysPastDue = (dueDateStr: string) => {
    const dueDate = new Date(dueDateStr);
    const today = new Date();
    const diffTime = today.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // 日付フォーマット
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const headerActions = (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      {selectedItems.size > 0 && (
        <span style={{
          fontSize: '14px',
          color: '#6b7280',
          fontWeight: '500'
        }}>
          {selectedItems.size}{t('selectedItemsCount')}
        </span>
      )}
      
      <button
        onClick={toggleSelectAll}
        disabled={!unpaidPayments || unpaidPayments.length === 0}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          backgroundColor: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          cursor: (!unpaidPayments || unpaidPayments.length === 0) ? 'not-allowed' : 'pointer',
          opacity: (!unpaidPayments || unpaidPayments.length === 0) ? 0.5 : 1
        }}
      >
        {unpaidPayments && selectedItems.size === unpaidPayments.length ? t('clearSelection') : t('selectAll')}
      </button>

      <button
        onClick={markAsPaid}
        disabled={selectedItems.size === 0 || updating}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          fontSize: '14px',
          fontWeight: '500',
          color: 'white',
          backgroundColor: selectedItems.size === 0 || updating ? '#9ca3af' : '#059669',
          border: 'none',
          borderRadius: '6px',
          cursor: selectedItems.size === 0 || updating ? 'not-allowed' : 'pointer'
        }}
      >
        <Check size={16} />
        {updating ? t('updating') : t('markSelectedAsPaid')}
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      <PageHeader
        title={t('unpaidPayments')}
        description={t('unpaidPaymentsDescription')}
        actions={headerActions}
      />

      <div style={{ padding: '24px' }}>
        {/* サマリーカード */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Receipt size={20} style={{ color: '#ef4444' }} />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
                {t('totalUnpaid')}
              </span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
              {formatCurrency(totalAmount)}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              {unpaidPayments ? unpaidPayments.length : 0} 件
            </div>
          </div>
        </div>

        {/* テーブル */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          {loading ? (
            <div style={{
              padding: '48px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f4f6',
                borderTop: '4px solid #2563eb',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }} />
              {t('loadingUnpaidPayments')}
            </div>
          ) : !unpaidPayments || unpaidPayments.length === 0 ? (
            <div style={{
              padding: '48px',
              textAlign: 'center'
            }}>
              <Check size={48} style={{ color: '#10b981', margin: '0 auto 16px', display: 'block' }} />
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>
                {t('noUnpaidPayments')}
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                {t('noUnpaidPaymentsDescription')}
              </p>
            </div>
          ) : (
            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e2e8f0',
                      width: '40px'
                    }}>
                      <input
                        type="checkbox"
                        checked={unpaidPayments && unpaidPayments.length > 0 && selectedItems.size === unpaidPayments.length}
                        onChange={toggleSelectAll}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      {t('transactionType')}
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      {t('customerName')}
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      {t('description')}
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'right',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      {t('amount')}
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      {t('dueDate')}
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      {t('daysPastDue')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {unpaidPayments && unpaidPayments.map((payment) => {
                    const daysPastDue = getDaysPastDue(payment.dueDate);
                    const isSelected = selectedItems.has(payment.id);

                    return (
                      <tr
                        key={payment.id}
                        style={{
                          backgroundColor: isSelected ? '#f0f9ff' : 'white',
                          borderBottom: '1px solid #f1f5f9'
                        }}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelection(payment.id)}
                            style={{ cursor: 'pointer' }}
                          />
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            fontSize: '12px',
                            fontWeight: '500',
                            borderRadius: '12px',
                            backgroundColor: payment.type === 'onetime' ? '#fef3c7' : '#e0e7ff',
                            color: payment.type === 'onetime' ? '#92400e' : '#3730a3'
                          }}>
                            {payment.type === 'onetime' ? t('onetime') : t('subscription')}
                          </span>
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#111827'
                        }}>
                          {payment.customerName}
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          fontSize: '14px',
                          color: '#6b7280',
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {payment.description || '-'}
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#111827',
                          textAlign: 'right'
                        }}>
                          {formatCurrency(Number(payment.amount))}
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          fontSize: '14px',
                          color: '#6b7280'
                        }}>
                          {formatDate(payment.dueDate)}
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          textAlign: 'center'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}>
                            {daysPastDue > 0 && (
                              <AlertCircle size={16} style={{ color: '#ef4444' }} />
                            )}
                            <span style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: daysPastDue > 0 ? '#ef4444' : '#6b7280'
                            }}>
                              {daysPastDue}日
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}