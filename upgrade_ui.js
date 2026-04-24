const fs = require("fs");

// ─── BUTTON ───────────────────────────────────────────────────────────────────
fs.writeFileSync("src/components/ui/button.tsx", `import { cn } from '@/lib/utils'
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
`);
console.log("button.tsx done");

// ─── CARD ─────────────────────────────────────────────────────────────────────
fs.writeFileSync("src/components/ui/card.tsx", `import { cn } from '@/lib/utils'

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
`);
console.log("card.tsx done");

// ─── BADGE ────────────────────────────────────────────────────────────────────
fs.writeFileSync("src/components/ui/badge.tsx", `import { cn } from '@/lib/utils'

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
`);
console.log("badge.tsx done");

// ─── INPUT ────────────────────────────────────────────────────────────────────
fs.writeFileSync("src/components/ui/input.tsx", `import { cn } from '@/lib/utils'
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
`);
console.log("input.tsx done");

// ─── SELECT ───────────────────────────────────────────────────────────────────
fs.writeFileSync("src/components/ui/select.tsx", `'use client'
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
        {label && <label className="text-sm font-semibold text-[#323232]">{label}</label>}
        <select
          ref={ref}
          className={cn(
            'w-full px-4 py-3 rounded-2xl border bg-white text-[#323232] text-sm',
            'border-black/10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]',
            'focus:outline-none focus:ring-2 focus:ring-[#FF6357]/25 focus:border-[#FF6357]/60',
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
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'
`);
console.log("select.tsx done");

// ─── LAYOUT ───────────────────────────────────────────────────────────────────
fs.writeFileSync("src/app/(dashboard)/layout.tsx", `import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!profile) redirect("/login")
  return (
    <div className="min-h-screen bg-[#F7F0E8]">
      <Sidebar profile={profile}/>
      <main className="min-h-screen hidden lg:block" style={{marginLeft: "240px"}}>
        <div style={{padding: "36px 36px 60px 36px"}}>{children}</div>
      </main>
      <main className="min-h-screen lg:hidden">
        <div style={{padding: "72px 20px 48px"}}>{children}</div>
      </main>
    </div>
  )
}
`);
console.log("layout.tsx done");

// ─── GLOBALS ──────────────────────────────────────────────────────────────────
fs.writeFileSync("src/app/globals.css", `@import 'tailwindcss';

@theme {
  --color-brand-dark: #323232;
  --color-brand-cream: #F7F0E8;
  --color-brand-coral: #FF6357;
}

*, *::before, *::after {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html {
  -webkit-text-size-adjust: 100%;
}

body {
  background-color: #F7F0E8;
  color: #323232;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

:root {
  --brand-dark: #323232;
  --brand-cream: #F7F0E8;
  --brand-coral: #FF6357;
}

.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
`);
console.log("globals.css done");

console.log("\nAll UI files upgraded successfully!");
