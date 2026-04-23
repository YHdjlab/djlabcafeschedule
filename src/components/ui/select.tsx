'use client'
import { cn } from '@/lib/utils'
import { SelectHTMLAttributes, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label className="text-sm font-medium text-[#323232]">{label}</label>}
        <select
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5 rounded-xl border bg-white text-[#323232] text-sm',
            'border-black/10 focus:outline-none focus:ring-2 focus:ring-[#FF6357]/30 focus:border-[#FF6357]',
            'transition-all duration-150 cursor-pointer',
            error && 'border-red-400',
            className
          )}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'
