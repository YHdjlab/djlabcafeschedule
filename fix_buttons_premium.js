const fs = require("fs");

// 1. Rewrite button.tsx - premium, elegant, no clipping
fs.writeFileSync("src/components/ui/button.tsx", `import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variants = {
  primary: 'bg-[#FF6357] hover:bg-[#e5554a] text-white shadow-sm hover:shadow-md',
  secondary: 'bg-[#323232] hover:bg-[#3e3e3e] text-white shadow-sm',
  ghost: 'bg-transparent hover:bg-black/6 text-[#323232]',
  danger: 'bg-red-500 hover:bg-red-600 text-white shadow-sm',
  outline: 'bg-white border border-black/12 hover:bg-black/3 text-[#323232] shadow-sm',
}

const sizes = {
  sm: 'px-4 py-2 text-xs font-semibold gap-1.5',
  md: 'px-5 py-2.5 text-sm font-semibold gap-2',
  lg: 'px-6 py-3 text-sm font-bold gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center rounded-2xl transition-all duration-150 whitespace-nowrap flex-shrink-0',
          'disabled:opacity-40 disabled:cursor-not-allowed',
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
console.log("button.tsx rewritten");

// 2. Fix layout - generous right padding
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
      <main className="min-h-screen hidden lg:block" style={{marginLeft:"240px", width:"calc(100% - 240px)"}}>
        <div style={{padding:"36px 48px 60px 40px"}}>{children}</div>
      </main>
      <main className="min-h-screen lg:hidden">
        <div style={{padding:"72px 24px 48px 24px"}}>{children}</div>
      </main>
    </div>
  )
}
`);
console.log("layout.tsx fixed");

// 3. Fix all inline button styles in admin-panel to use consistent premium style
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Save and Submit button
ap = ap.replace(
  `className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6357] text-white text-sm font-bold hover:bg-[#e5554a] transition-all disabled:opacity-50 shadow-sm"`,
  `className="flex-shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#FF6357] text-white text-sm font-bold hover:bg-[#e5554a] transition-all disabled:opacity-50 shadow-sm whitespace-nowrap"`
);

// Generate button
ap = ap.replace(
  /className="[^"]*bg-\[#FF6357\][^"]*rounded-xl[^"]*"/g,
  `className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FF6357] text-white text-sm font-bold hover:bg-[#e5554a] transition-all shadow-sm whitespace-nowrap"`
);

// Approve buttons
ap = ap.replace(
  /className="[^"]*bg-green-500[^"]*rounded-xl[^"]*"/g,
  `className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-green-500 text-white text-xs font-bold hover:bg-green-600 transition-all whitespace-nowrap"`
);

// Swap/Assign selects - make them premium
ap = ap.replace(
  /className={cn\("text-xs rounded-xl px-2 py-1 border-2 cursor-pointer font-bold bg-white flex-shrink-0", roleTextColor, "border-current\/30"\)}/g,
  `className={cn("text-xs rounded-xl px-3 py-1.5 border-2 cursor-pointer font-bold bg-white flex-shrink-0 whitespace-nowrap", roleTextColor, "border-current/40 hover:border-current/70 transition-colors")}`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("admin-panel buttons fixed");

// 4. Fix dashboard inline buttons
let dp = fs.readFileSync("src/app/(dashboard)/dashboard/page.tsx", "utf8");
dp = dp.replace(
  `className="flex-shrink-0 flex items-center gap-2 bg-[#FF6357] hover:bg-[#e5554a] text-white px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all"`,
  `className="flex-shrink-0 flex items-center gap-2 bg-[#FF6357] hover:bg-[#e5554a] text-white px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all whitespace-nowrap shadow-sm"`
);
fs.writeFileSync("src/app/(dashboard)/dashboard/page.tsx", dp, "utf8");
console.log("dashboard buttons fixed");

console.log("\nAll done!");
