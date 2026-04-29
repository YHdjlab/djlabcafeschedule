import { cn } from '@/lib/utils'

export function Card({ children, className, padding = 'md' }: { children: React.ReactNode; className?: string; padding?: 'none'|'sm'|'md'|'lg' }) {
  const p = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' }[padding]
  return <div style={{backgroundColor:'#242424',borderRadius:'16px',border:'1px solid rgba(255,255,255,0.08)'}} className={cn(p, className)}>{children}</div>
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex items-center justify-between mb-4', className)}>{children}</div>
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 style={{color:'#F7F0E8',fontSize:'15px',fontWeight:700}} className={className}>{children}</h3>
}
