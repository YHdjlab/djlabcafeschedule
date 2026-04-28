import { cn } from '@/lib/utils'

export function Card({ children, className, padding = 'md' }: { children: React.ReactNode; className?: string; padding?: 'none'|'sm'|'md'|'lg' }) {
  const p = { none: '', sm: 'p-5', md: 'p-6', lg: 'p-8' }[padding]
  return <div className={cn('bg-white rounded-3xl border border-black/[0.06] shadow-sm', p, className)}>{children}</div>
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex items-center justify-between mb-5', className)}>{children}</div>
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('text-base font-bold text-[#323232]', className)}>{children}</h3>
}
