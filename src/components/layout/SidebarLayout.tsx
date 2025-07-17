'use client';

import { SidebarNavigation } from './SidebarNavigation';
import { type ReactNode, useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface SidebarLayoutProps {
  children: ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size and update mobile state
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'white' }}>
      {/* Mobile Menu Button - Only show on mobile */}
      {isMobile && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            position: 'fixed',
            top: '16px',
            left: '16px',
            zIndex: 60,
            display: 'block',
            padding: '8px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            cursor: 'pointer',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}
        >
          {isMobileMenuOpen ? (
            <X style={{ height: '20px', width: '20px', color: '#374151' }} />
          ) : (
            <Menu style={{ height: '20px', width: '20px', color: '#374151' }} />
          )}
        </button>
      )}

      {/* Mobile Overlay - Only show on mobile when menu is open */}
      {isMobile && isMobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40
          }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: isMobile ? (isMobileMenuOpen ? 0 : '-260px') : 0,
          width: '260px',
          height: '100vh',
          zIndex: 50,
          transition: isMobile ? 'left 0.3s ease-in-out' : 'none',
          backgroundColor: 'white',
          flexShrink: 0
        }}
      >
        <SidebarNavigation />
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          marginLeft: isMobile ? 0 : '260px'
        }}
      >
        {children}
      </div>
    </div>
  );
}