import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variants = {
  primary: 'bg-[#FF6357] hover:bg-[#e5554a] active:bg-[#d44840] text-white shadow-[0_1px_3px_rgba(255,99,87,0.4)] hover:shadow-[0_4px_12px_rgba(255,99,87,0.35)]',
  secondary: 'bg-[#323232] hover:bg-[#3e3e3e] active:bg-[#2a2a2a] text-white shadow-[0_1px_3px_rgba(0,0,0,0.2)]',
  ghost: 'bg-transparent hover:bg-black/6 active:bg-black/10 text-[#323232]',
  danger: 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white shadow-[0_1px_3px_rgba(239,68,68,0.35)]',
  outline: 'bg-white border border-black/12 hover:border-black/20 hover:bg-black/3 active:bg-black/6 text-[#323232] shadow-[0_1px_2px_rgba(0,0,0,0.06)]',
}

const sizes = {
  sm: 'px-3.5 py-2 text-xs font-semibold gap-1.5',
  md: 'px-5 py-2.5 text-sm font-semibold gap-2',
  lg: 'px-7 py-3.5 text-sm font-bold gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center rounded-2xl transition-all duration-150',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none',
          'active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6357]/40',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Loading...
          </span>
        ) : children}
      </button>
    )
  }
)
Button.displayName = 'Button'
