"use client";

import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

export function PageLoader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={`skeleton-card-${i}`} className="h-40 w-full rounded-lg" />
        ))}
      </div>
      
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/4" />
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={`skeleton-row-${i}`} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </motion.div>
  );
}