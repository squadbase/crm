"use client";

import { useMemo } from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
  color?: string;
}

export function Sparkline({ 
  data, 
  width = 100, 
  height = 24, 
  className = "", 
  color = "currentColor" 
}: SparklineProps) {
  const path = useMemo(() => {
    if (data.length < 2) return "";
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    
    if (range === 0) {
      // If all values are the same, draw a straight line
      return `M 0 ${height / 2} L ${width} ${height / 2}`;
    }
    
    const xStep = width / (data.length - 1);
    
    return data
      .map((value, index) => {
        const x = index * xStep;
        const y = height - ((value - min) / range) * height;
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }, [data, width, height]);

  return (
    <svg 
      width={width} 
      height={height} 
      className={`inline-block ${className}`}
      viewBox={`0 0 ${width} ${height}`}
    >
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}