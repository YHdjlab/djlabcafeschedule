import { cn } from '@/lib/utils'

const variants: Record<string, React.CSSProperties> = {
  default: { backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(247,240,232,0.6)' },
  green:   { backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e' },
  yellow:  { backgroundColor: 'rgba(234,179,8,0.15)', color: '#eab308' },
  red:     { backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  blue:    { backgroundColor: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  purple:  { backgroundColor: 'rgba(168,85,247,0.15)', color: '#a855f7' },
  coral:   { backgroundColor: 'rgba(255,99,87,0.15)', color: '#FF6357' },
}

export function Badge({ children, variant = 'default', className }: { children: React.ReactNode; variant?: string; className?: string }) {
  return (
    <span style={{...variants[variant] || variants.default, fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'20px', whiteSpace:'nowrap' as const}}
      className={className}>
      {children}
    </span>
  )
}
