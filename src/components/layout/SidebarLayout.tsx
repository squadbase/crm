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
    <div className="flex min-h-screen bg-white">
      {/* Mobile Menu Button - Only show on mobile */}
      {isMobile && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-4 left-4 z-[60] block p-2 bg-white border border-gray-200 rounded-md cursor-pointer shadow-sm"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5 text-gray-700" />
          ) : (
            <Menu className="h-5 w-5 text-gray-700" />
          )}
        </button>
      )}

      {/* Mobile Overlay - Only show on mobile when menu is open */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 w-[260px] h-screen z-50 bg-white flex-shrink-0 ${
          isMobile
            ? `transition-all duration-300 ease-in-out ${
                isMobileMenuOpen ? 'left-0' : '-left-[260px]'
              }`
            : 'left-0'
        }`}
      >
        <SidebarNavigation />
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col min-w-0 ${
          isMobile ? 'ml-0' : 'ml-[260px]'
        }`}
      >
        {children}
      </div>
    </div>
  );
}