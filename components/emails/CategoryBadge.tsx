'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { EmailCategory } from '@/types';
import { Briefcase, HeadphonesIcon, Trash2 } from 'lucide-react';

interface CategoryBadgeProps {
  category: EmailCategory;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

const categoryConfig: Record<
  EmailCategory,
  { label: string; className: string; icon: typeof Briefcase }
> = {
  CRM: {
    label: 'CRM',
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30',
    icon: Briefcase,
  },
  CS: {
    label: 'Customer Support',
    className: 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30',
    icon: HeadphonesIcon,
  },
  Spam: {
    label: 'Spam',
    className: 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30',
    icon: Trash2,
  },
};

export function CategoryBadge({ category, showIcon = true, size = 'sm' }: CategoryBadgeProps) {
  const config = categoryConfig[category];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium transition-colors',
        config.className,
        size === 'sm' && 'text-xs px-2 py-0.5',
        size === 'md' && 'text-sm px-3 py-1'
      )}
    >
      {showIcon && <Icon className={cn('mr-1', size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />}
      {config.label}
    </Badge>
  );
}


