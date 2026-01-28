import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border border-white/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider',
  {
    variants: {
      variant: {
        default: 'bg-white/5 text-white/80',
        success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        danger: 'bg-red-500/15 text-red-300 border-red-500/30',
        info: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
