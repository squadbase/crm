'use client';

import { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, Package, Briefcase } from 'lucide-react';

interface SummaryData {
  totalTemplates: number;
  activeTemplates: number;
  inactiveTemplates: number;
  productTemplates: number;
  projectTemplates: number;
}

export function TemplateSummary() {
  const [summary, setSummary] = useState<SummaryData>({
    totalTemplates: 0,
    activeTemplates: 0,
    inactiveTemplates: 0,
    productTemplates: 0,
    projectTemplates: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await fetch('/api/order-templates/summary');
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: '総テンプレート数',
      value: summary.totalTemplates,
      icon: FileText,
      color: '#2563eb'
    },
    {
      title: 'アクティブ',
      value: summary.activeTemplates,
      icon: CheckCircle,
      color: '#16a34a'
    },
    {
      title: '非アクティブ',
      value: summary.inactiveTemplates,
      icon: XCircle,
      color: '#dc2626'
    },
    {
      title: 'プロダクト',
      value: summary.productTemplates,
      icon: Package,
      color: '#7c3aed'
    },
    {
      title: 'プロジェクト',
      value: summary.projectTemplates,
      icon: Briefcase,
      color: '#ea580c'
    }
  ];

  if (loading) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {[1, 2, 3, 4, 5].map((index) => (
          <div
            key={index}
            style={{
              padding: '16px',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              height: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9ca3af'
            }}
          >
            読み込み中...
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    }}>
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            style={{
              padding: '16px',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              transition: 'box-shadow 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Icon 
                  size={20} 
                  style={{ color: card.color }} 
                />
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  margin: 0
                }}>
                  {card.title}
                </h3>
              </div>
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#0f172a',
              marginBottom: '4px'
            }}>
              {card.value.toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}