import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variants = {
  primary: 'bg-[#FF6357] hover:bg-[#e5554a] text-white shadow-sm hover:shadow-md',
  secondary: 'bg-[#323232] hover:bg-[#3e3e3e] text-white shadow-sm',
  ghost: 'bg-transparent hover:bg-black/5 text-[#323232]',
  danger: 'bg-red-500 hover:bg-red-600 text-white shadow-sm',
  outline: 'bg-white border border-black/10 hover:bg-black/3 text-[#323232] shadow-sm',
}

const sizes = {
  sm: 'px-4 py-2 text-xs font-semibold gap-1.5',
  md: 'px-5 py-2.5 text-sm font-semibold gap-2',
  lg: 'px-6 py-3 text-sm font-bold gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => (
    <button ref={ref} disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-2xl transition-all duration-150 whitespace-nowrap flex-shrink-0',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant], sizes[size], className
      )} {...props}>
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>Loading...
        </span>
      ) : children}
    </button>
  )
)
Button.displayName = 'Button'
