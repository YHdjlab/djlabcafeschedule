import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label className="text-sm font-semibold text-[#323232]">{label}</label>}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 rounded-2xl border bg-white text-[#323232] text-sm placeholder:text-gray-300',
            'border-black/10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]',
            'focus:outline-none focus:ring-2 focus:ring-[#FF6357]/25 focus:border-[#FF6357]/60',
            'transition-all duration-150',
            error && 'border-red-400 focus:ring-red-200',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
