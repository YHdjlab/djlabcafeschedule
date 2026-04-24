import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddings = {
  none: '',
  sm: 'p-5',
  md: 'p-6',
  lg: 'p-8',
}

export function Card({ children, className, padding = 'md' }: CardProps) {
  return (
    <div className={cn(
      'bg-white rounded-3xl border border-black/[0.06] shadow-[0_1px_4px_rgba(0,0,0,0.06)]',
      paddings[padding], className
    )}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex items-center justify-between mb-5', className)}>{children}</div>
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('text-base font-bold text-[#323232] tracking-tight', className)}>{children}</h3>
}
