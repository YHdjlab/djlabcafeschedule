import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'coral' | 'green' | 'yellow' | 'red' | 'blue' | 'purple'
  className?: string
}

const variants = {
  default:  'bg-gray-100 text-gray-600 border border-gray-200/80',
  coral:    'bg-[#FF6357]/10 text-[#FF6357] border border-[#FF6357]/20',
  green:    'bg-green-50 text-green-700 border border-green-200/80',
  yellow:   'bg-amber-50 text-amber-700 border border-amber-200/80',
  red:      'bg-red-50 text-red-600 border border-red-200/80',
  blue:     'bg-blue-50 text-blue-600 border border-blue-200/80',
  purple:   'bg-purple-50 text-purple-600 border border-purple-200/80',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide',
      variants[variant], className
    )}>
      {children}
    </span>
  )
}
