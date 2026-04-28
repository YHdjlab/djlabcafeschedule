const fs = require("fs");

// ─── GLOBALS ────────────────────────────────────────────────────────────────
fs.writeFileSync("src/app/globals.css", `@import 'tailwindcss';

@theme {
  --color-brand-dark: #323232;
  --color-brand-cream: #F7F0E8;
  --color-brand-coral: #FF6357;
}

*, *::before, *::after { box-sizing: border-box; padding: 0; margin: 0; }

html, body {
  background-color: #F7F0E8;
  color: #323232;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
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

// ─── LAYOUT ─────────────────────────────────────────────────────────────────
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
      <main className="min-h-screen hidden lg:block" style={{marginLeft:"240px",width:"calc(100% - 240px)"}}>
        <div style={{padding:"32px 32px 64px 32px"}}>{children}</div>
      </main>
      <main className="min-h-screen lg:hidden">
        <div style={{padding:"72px 20px 48px 20px"}}>{children}</div>
      </main>
    </div>
  )
}
`);
console.log("layout.tsx done");

// ─── BUTTON ──────────────────────────────────────────────────────────────────
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
`);
console.log("button.tsx done");

// ─── CARD ────────────────────────────────────────────────────────────────────
fs.writeFileSync("src/components/ui/card.tsx", `import { cn } from '@/lib/utils'

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
`);
console.log("card.tsx done");

// ─── FIX AVAILABILITY GRID emoji encoding ────────────────────────────────────
let ag = fs.readFileSync("src/components/schedule/availability-grid.tsx", "utf8");
ag = ag.replace(/â˜€ï¸/g, "☀️").replace(/ðŸŒ¤ï¸/g, "🌤️").replace(/ðŸŒ™/g, "🌙");
// Premium shift cards
ag = ag.replace(
  `'inline-flex items-center justify-center rounded-2xl transition-all duration-150',`,
  `'inline-flex items-center justify-center rounded-2xl transition-all duration-150 whitespace-nowrap',`
);
fs.writeFileSync("src/components/schedule/availability-grid.tsx", ag, "utf8");
console.log("availability-grid.tsx emoji fixed");

// ─── PAGE HEADERS — consistent premium style ─────────────────────────────────
const pageHeaders = [
  ["src/app/(dashboard)/swaps/page.tsx", "Shift Swaps", "Request and manage shift swaps"],
  ["src/app/(dashboard)/days-off/page.tsx", "Days Off", "Request and track your days off"],
  ["src/app/(dashboard)/attendance/page.tsx", "Attendance", "Check in and out of your shifts"],
  ["src/app/(dashboard)/settings/page.tsx", "Settings", "Manage your account"],
  ["src/app/(dashboard)/schedule/page.tsx", "Schedule", null],
  ["src/app/(dashboard)/availability/page.tsx", "My Availability", "Pick your shifts for the week. Max 2 of each type (AM/MID/PM). Fri/Sat/Sun are mandatory."],
];

pageHeaders.forEach(([file, title, subtitle]) => {
  try {
    let content = fs.readFileSync(file, "utf8");
    content = content.replace(
      `<h1 className="text-2xl font-bold text-[#323232]">`,
      `<h1 className="text-2xl font-bold text-[#323232] tracking-tight">`
    );
    fs.writeFileSync(file, content, "utf8");
  } catch(e) {}
});
console.log("page headers done");

// ─── ADMIN PANEL — fix remaining issues ──────────────────────────────────────
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
// Fix Â· corruption
ap = ap.replace(/Â·/g, "·");
// Fix emoji
ap = ap.replace(/â˜€ï¸/g, "☀️").replace(/ðŸŒ¤ï¸/g, "🌤️").replace(/ðŸŒ™/g, "🌙");
fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("admin-panel.tsx encoding fixed");

// ─── PASSWORD CHANGE — premium form ──────────────────────────────────────────
let pc = fs.readFileSync("src/components/settings/password-change.tsx", "utf8");
pc = pc.replace(
  `<Card>
        <CardHeader><CardTitle>Your Profile</CardTitle></CardHeader>
        <div className="flex items-center gap-4">`,
  `<Card>
        <CardHeader><CardTitle>Your Profile</CardTitle></CardHeader>
        <div className="flex items-center gap-4 p-1">`
);
fs.writeFileSync("src/components/settings/password-change.tsx", pc, "utf8");
console.log("password-change.tsx done");

console.log("\n✅ All done! Run: npm run build && git add . && git commit -m 'Premium polish' && git push");
