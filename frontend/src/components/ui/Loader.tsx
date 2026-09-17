import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoaderProps {
  text?: string;
  className?: string;
}

export function Loader({ text, className }: LoaderProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8', className)}>
      <Loader2 className="w-8 h-8 text-herb-green-600 animate-spin mb-4" />
      {text && <p className="text-sm font-medium text-gray-600">{text}</p>}
    </div>
  );
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse bg-gray-200 rounded', className)} />
  );
}
