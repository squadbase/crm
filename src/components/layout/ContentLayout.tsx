'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ContentLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  className?: string;
}

export function ContentLayout({ children, header, className = "" }: ContentLayoutProps) {
  return (
    <motion.main 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={`flex-1 overflow-auto bg-white ${className}`}
    >
      {header && (
        <div className="px-container py-6 bg-white border-b border-line">
          {header}
        </div>
      )}
      <div className="px-container py-8 space-y-8">
        {children}
      </div>
    </motion.main>
  );
}