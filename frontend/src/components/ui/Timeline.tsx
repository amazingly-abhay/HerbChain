import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  icon?: React.ReactNode;
  color?: string;
  isActive?: boolean;
  isCompleted?: boolean;
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export default function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Vertical line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

      <div className="space-y-8 relative">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-6"
          >
            {/* Indicator */}
            <div className="relative flex-shrink-0 z-10">
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center bg-white border-2 transition-all',
                  item.isCompleted ? 'border-herb-green-500 bg-herb-green-50' : 'border-gray-200',
                  item.isActive && 'ring-4 ring-herb-green-500/20 border-herb-green-500'
                )}
              >
                {item.isCompleted ? (
                  <Check className="w-5 h-5 text-herb-green-600" />
                ) : item.icon ? (
                  <div className={item.isActive ? 'text-herb-green-600' : 'text-gray-400'}>
                    {item.icon}
                  </div>
                ) : (
                  <div
                    className={cn(
                      'w-3 h-3 rounded-full',
                      item.isActive ? 'bg-herb-green-600' : 'bg-gray-300'
                    )}
                  />
                )}
              </div>
              
              {/* Active pulse effect */}
              {item.isActive && (
                <div className="absolute inset-0 rounded-full animate-ping bg-herb-green-500 opacity-20" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pt-2 pb-2">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-1 gap-2">
                <h4
                  className={cn(
                    'text-base font-semibold',
                    item.isActive ? 'text-gray-900' : 'text-gray-700'
                  )}
                >
                  {item.title}
                </h4>
                <time className="text-sm font-medium text-gray-500 whitespace-nowrap">
                  {item.timestamp}
                </time>
              </div>
              {item.description && (
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
