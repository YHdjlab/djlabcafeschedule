const fs = require("fs");

const BG = '#1a1a1a';
const CARD = '#242424';
const CARD2 = '#2e2e2e';
const BORDER = 'rgba(255,255,255,0.08)';
const CORAL = '#FF6357';
const CREAM = '#F7F0E8';
const MUTED = 'rgba(247,240,232,0.45)';

// ─── 1. CARD COMPONENT ───────────────────────────────────────────────────────
fs.writeFileSync("src/components/ui/card.tsx", `import { cn } from '@/lib/utils'

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
`);
console.log("card.tsx done");

// ─── 2. BADGE COMPONENT ──────────────────────────────────────────────────────
fs.writeFileSync("src/components/ui/badge.tsx", `import { cn } from '@/lib/utils'

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
`);
console.log("badge.tsx done");

// ─── 3. SELECT COMPONENT ─────────────────────────────────────────────────────
fs.writeFileSync("src/components/ui/select.tsx", `import { cn } from '@/lib/utils'
import { SelectHTMLAttributes, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string; error?: string; options?: {value:string;label:string}[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, children, ...props }, ref) => (
    <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
      {label && <label style={{color:'rgba(247,240,232,0.5)',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em'}}>{label}</label>}
      <select ref={ref} style={{width:'100%',padding:'10px 14px',borderRadius:'10px',border:error?'1px solid #ef4444':'1px solid rgba(255,255,255,0.1)',backgroundColor:'#2e2e2e',color:'#F7F0E8',fontSize:'14px',cursor:'pointer'}} className={className} {...props}>
        {options ? options.map(o => <option key={o.value} value={o.value}>{o.label}</option>) : children}
      </select>
      {error && <p style={{color:'#ef4444',fontSize:'12px'}}>{error}</p>}
    </div>
  )
)
Select.displayName = 'Select'
`);
console.log("select.tsx done");

// ─── 4. BUTTON - dark ghost/outline ──────────────────────────────────────────
fs.writeFileSync("src/components/ui/button.tsx", `import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variants = {
  primary: { backgroundColor: '#FF6357', color: 'white', boxShadow: '0 2px 8px rgba(255,99,87,0.3)' },
  secondary: { backgroundColor: '#2e2e2e', color: '#F7F0E8', border: '1px solid rgba(255,255,255,0.1)' },
  ghost: { backgroundColor: 'transparent', color: 'rgba(247,240,232,0.6)' },
  danger: { backgroundColor: '#ef4444', color: 'white' },
  outline: { backgroundColor: 'transparent', color: 'rgba(247,240,232,0.7)', border: '1px solid rgba(255,255,255,0.12)' },
}

const sizes = {
  sm: { padding: '6px 14px', fontSize: '12px', gap: '4px' },
  md: { padding: '9px 18px', fontSize: '13px', gap: '6px' },
  lg: { padding: '12px 24px', fontSize: '14px', gap: '8px' },
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, style, ...props }, ref) => (
    <button ref={ref} disabled={disabled || loading}
      style={{
        display:'inline-flex', alignItems:'center', justifyContent:'center',
        borderRadius:'10px', border:'none', cursor: disabled||loading ? 'not-allowed' : 'pointer',
        fontWeight:600, whiteSpace:'nowrap', flexShrink:0, transition:'all 0.15s',
        opacity: disabled||loading ? 0.4 : 1,
        ...variants[variant], ...sizes[size], ...style
      }}
      className={className} {...props}>
      {loading ? (
        <span style={{display:'flex',alignItems:'center',gap:'6px'}}>
          <svg style={{animation:'spin 1s linear infinite',width:'14px',height:'14px'}} fill="none" viewBox="0 0 24 24">
            <circle style={{opacity:0.25}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path style={{opacity:0.75}} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>Loading...
        </span>
      ) : children}
    </button>
  )
)
Button.displayName = 'Button'
`);
console.log("button.tsx done");

// ─── 5. SCHEDULE VIEW - fix remaining light elements ─────────────────────────
let sv = fs.readFileSync("src/components/schedule/schedule-view.tsx", "utf8");

// Week nav wrapper still white
sv = sv.replace(
  '<div className="bg-white rounded-3xl border border-black/[0.06] shadow-sm p-4 flex items-center justify-between">',
  '<div style={{backgroundColor:"#242424",borderRadius:"16px",border:"1px solid rgba(255,255,255,0.08)",padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px"}}>'
);
sv = sv.replace(
  /className="w-10 h-10 rounded-2xl bg-\[#F7F0E8\] hover:bg-black\/10 flex items-center justify-center transition-colors"/g,
  `style={{width:'36px',height:'36px',borderRadius:'10px',backgroundColor:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.08)',color:'#F7F0E8',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}`
);
sv = sv.replace(
  `<p className="font-bold text-[#323232]">{format(currentWeek, 'MMM d')} â€" {format(addDays(currentWeek, 6), 'MMM d, yyyy')}</p>`,
  `<p style={{color:'#F7F0E8',fontSize:'14px',fontWeight:700}}>{format(currentWeek, 'MMM d')} – {format(addDays(currentWeek, 6), 'MMM d, yyyy')}</p>`
);
sv = sv.replace(
  `<p className="text-xs text-gray-400 mt-0.5">{weekSlots.length} shifts this week</p>`,
  `<p style={{color:'rgba(247,240,232,0.45)',fontSize:'12px',marginTop:'2px'}}>{weekSlots.length} shifts this week</p>`
);

// Fix rush band - white bg
sv = sv.replace(
  'className="flex-1 h-2 rounded-full bg-gray-100 relative overflow-hidden"',
  'style={{flex:1,height:"6px",borderRadius:"20px",backgroundColor:"rgba(255,255,255,0.06)",position:"relative",overflow:"hidden"}}'
);
sv = sv.replace(
  '<div className="flex gap-3 text-xs whitespace-nowrap">',
  '<div style={{display:"flex",gap:"12px",fontSize:"11px",whiteSpace:"nowrap",flexShrink:0}}>'
);
sv = sv.replace(
  /className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-200 inline-block"\/>Off-rush<\/span>/g,
  `style={{display:"flex",alignItems:"center",gap:"4px",color:"rgba(247,240,232,0.45)"}}><span style={{width:"6px",height:"6px",borderRadius:"50%",backgroundColor:"rgba(96,165,250,0.5)",display:"inline-block"}}/>Off-rush</span>`
);
sv = sv.replace(
  /className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-300 inline-block"\/>Rush 3pm-9pm<\/span>/g,
  `style={{display:"flex",alignItems:"center",gap:"4px",color:"rgba(247,240,232,0.45)"}}><span style={{width:"6px",height:"6px",borderRadius:"50%",backgroundColor:"rgba(251,146,60,0.6)",display:"inline-block"}}/>Rush 3pm-9pm</span>`
);

fs.writeFileSync("src/components/schedule/schedule-view.tsx", sv, "utf8");
console.log("schedule-view.tsx done");

// ─── 6. ATTENDANCE MANAGER ───────────────────────────────────────────────────
let am = fs.readFileSync("src/components/schedule/attendance-manager.tsx", "utf8");
am = am.replace(
  `className="flex items-center justify-between p-3 rounded-xl bg-[#F7F0E8]"`,
  `style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px',borderRadius:'10px',backgroundColor:'rgba(255,255,255,0.05)'}}`
);
am = am.replace(
  `className="font-semibold text-[#323232]"`,
  `style={{color:'#F7F0E8',fontWeight:600}}`
);
am = am.replace(
  `<div className="p-3 rounded-xl bg-green-50">`,
  `<div style={{padding:'12px',borderRadius:'10px',backgroundColor:'rgba(34,197,94,0.1)'}}>`
);
am = am.replace(
  `<p className="text-xs text-gray-500">Checked out at</p>`,
  `<p style={{color:'rgba(247,240,232,0.4)',fontSize:'11px'}}>Checked out at</p>`
);
am = am.replace(
  `<p className="font-semibold text-green-700">{todayRecord.checkout_time}</p>`,
  `<p style={{color:'#22c55e',fontWeight:600}}>{todayRecord.checkout_time}</p>`
);
am = am.replace(
  `<p className="text-sm text-center text-gray-400">Awaiting supervisor approval</p>`,
  `<p style={{color:'rgba(247,240,232,0.4)',fontSize:'13px',textAlign:'center'}}>Awaiting supervisor approval</p>`
);
fs.writeFileSync("src/components/schedule/attendance-manager.tsx", am, "utf8");
console.log("attendance-manager.tsx done");

// ─── 7. PASSWORD CHANGE ──────────────────────────────────────────────────────
let pc = fs.readFileSync("src/components/settings/password-change.tsx", "utf8");
pc = pc.replace(
  `<div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl">`,
  `<div style={{display:'flex',alignItems:'center',gap:'8px',padding:'12px',backgroundColor:'rgba(239,68,68,0.1)',borderRadius:'10px',border:'1px solid rgba(239,68,68,0.2)'}}>`
);
pc = pc.replace(
  `<div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-100 rounded-2xl">`,
  `<div style={{display:'flex',alignItems:'center',gap:'8px',padding:'12px',backgroundColor:'rgba(34,197,94,0.1)',borderRadius:'10px',border:'1px solid rgba(34,197,94,0.2)'}}>`
);
pc = pc.replace(
  `<p className="text-sm text-red-500">{error}</p>`,
  `<p style={{color:'#ef4444',fontSize:'13px'}}>{error}</p>`
);
pc = pc.replace(
  `<p className="text-sm text-green-600 font-medium">Password changed successfully!</p>`,
  `<p style={{color:'#22c55e',fontSize:'13px',fontWeight:500}}>Password changed successfully!</p>`
);
fs.writeFileSync("src/components/settings/password-change.tsx", pc, "utf8");
console.log("password-change.tsx done");

// ─── 8. DASHBOARD PAGE ───────────────────────────────────────────────────────
let dp = fs.readFileSync("src/app/(dashboard)/dashboard/page.tsx", "utf8");

// Quick action cards - dark
dp = dp.replace(
  `{ href: '/schedule', icon: <Calendar size={20}/>, label: 'Schedule', bg: 'bg-orange-50', color: 'text-[#FF6357]' },`,
  `{ href: '/schedule', icon: <Calendar size={20}/>, label: 'Schedule', bg: 'rgba(255,99,87,0.12)', color: '#FF6357' },`
);
dp = dp.replace(
  `{ href: '/availability', icon: <Clock size={20}/>, label: 'Availability', bg: 'bg-blue-50', color: 'text-blue-500' },`,
  `{ href: '/availability', icon: <Clock size={20}/>, label: 'Availability', bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },`
);
dp = dp.replace(
  `{ href: '/swaps', icon: <ArrowLeftRight size={20}/>, label: 'Swaps', bg: 'bg-purple-50', color: 'text-purple-500' },`,
  `{ href: '/swaps', icon: <ArrowLeftRight size={20}/>, label: 'Swaps', bg: 'rgba(168,85,247,0.12)', color: '#a855f7' },`
);
dp = dp.replace(
  `{ href: '/days-off', icon: <CalendarOff size={20}/>, label: 'Days Off', bg: 'bg-green-50', color: 'text-green-500' },`,
  `{ href: '/days-off', icon: <CalendarOff size={20}/>, label: 'Days Off', bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },`
);
dp = dp.replace(
  `{ href: '/attendance', icon: <CheckSquare size={20}/>, label: 'Attendance', bg: 'bg-yellow-50', color: 'text-yellow-600' },`,
  `{ href: '/attendance', icon: <CheckSquare size={20}/>, label: 'Attendance', bg: 'rgba(234,179,8,0.12)', color: '#eab308' },`
);
dp = dp.replace(
  `{ href: '/admin', icon: <Settings size={20}/>, label: 'Admin', bg: 'bg-gray-100', color: 'text-gray-600' }`,
  `{ href: '/admin', icon: <Settings size={20}/>, label: 'Admin', bg: 'rgba(255,255,255,0.08)', color: 'rgba(247,240,232,0.6)' }`
);

// Quick action link cards
dp = dp.replace(
  `className="group flex flex-col items-center gap-2.5 p-4 bg-white rounded-2xl hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border border-black/5"`,
  `style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'10px',padding:'16px',backgroundColor:'#242424',borderRadius:'14px',border:'1px solid rgba(255,255,255,0.08)',textDecoration:'none',transition:'all 0.15s'}}`
);
dp = dp.replace(
  `<div className={\`p-3 rounded-xl \${action.bg} \${action.color} transition-transform duration-200 group-hover:scale-110\`}>{action.icon}</div>`,
  `<div style={{padding:'10px',borderRadius:'10px',backgroundColor:action.bg,color:action.color}}>{action.icon}</div>`
);
dp = dp.replace(
  `<span className="text-xs font-semibold text-[#323232]">{action.label}</span>`,
  `<span style={{fontSize:'12px',fontWeight:600,color:'rgba(247,240,232,0.7)'}}>{action.label}</span>`
);

// Stats cards
dp = dp.replace(
  `className="bg-white rounded-2xl p-4 border border-black/5"`,
  `style={{backgroundColor:'#242424',borderRadius:'14px',border:'1px solid rgba(255,255,255,0.08)',padding:'16px'}}`
);
dp = dp.replace(
  `<span className="text-xs font-medium text-gray-400">{stat.label}</span>`,
  `<span style={{color:'rgba(247,240,232,0.4)',fontSize:'11px',fontWeight:500}}>{stat.label}</span>`
);
dp = dp.replace(
  `<p className="text-3xl font-bold text-[#323232]">{stat.value}</p>`,
  `<p style={{color:'#F7F0E8',fontSize:'28px',fontWeight:800,lineHeight:1}}>{stat.value}</p>`
);

// Today on floor card
dp = dp.replace(
  `<div className="bg-white rounded-2xl border border-black/5">`,
  `<div style={{backgroundColor:'#242424',borderRadius:'14px',border:'1px solid rgba(255,255,255,0.08)'}}>`
);
dp = dp.replace(
  `<div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">`,
  `<div style={{padding:'14px 18px',borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>`
);
dp = dp.replace(
  /className="font-semibold text-\[#323232\]"/g,
  `style={{color:'#F7F0E8',fontWeight:600}}`
);
dp = dp.replace(
  `<div className="divide-y divide-black/5">`,
  `<div>`
);
dp = dp.replace(
  /className={\`px-5 py-4 flex items-center justify-between \${mine \? 'bg-orange-50\/40' : ''}\`}/g,
  `style={{padding:'14px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',backgroundColor: mine ? 'rgba(255,99,87,0.06)' : 'transparent',borderBottom:'1px solid rgba(255,255,255,0.04)'}}`
);
dp = dp.replace(
  /className="text-sm font-semibold text-\[#323232\]"/g,
  `style={{color:'#F7F0E8',fontSize:'13px',fontWeight:600}}`
);
dp = dp.replace(
  /className="text-xs text-gray-400 mt-1"/g,
  `style={{color:'rgba(247,240,232,0.4)',fontSize:'11px',marginTop:'4px'}}`
);

// Needs attention card
dp = dp.replace(
  `<div className="px-5 py-3.5 flex items-center gap-3">`,
  `<div style={{padding:'14px 18px',display:'flex',alignItems:'center',gap:'12px',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>`
);
dp = dp.replace(
  /className="text-sm font-medium text-\[#323232\] truncate"/g,
  `style={{color:'#F7F0E8',fontSize:'13px',fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}`
);
dp = dp.replace(
  /className="text-xs text-gray-400"/g,
  `style={{color:'rgba(247,240,232,0.4)',fontSize:'11px'}}`
);

// Empty state
dp = dp.replace(
  `<div className="bg-white rounded-2xl border border-black/5 p-10 text-center">`,
  `<div style={{backgroundColor:'#242424',borderRadius:'14px',border:'1px solid rgba(255,255,255,0.08)',padding:'40px',textAlign:'center'}}>`
);
dp = dp.replace(
  `<div className="w-14 h-14 bg-[#F7F0E8] rounded-2xl flex items-center justify-center mx-auto mb-4">`,
  `<div style={{width:'56px',height:'56px',backgroundColor:'rgba(255,255,255,0.06)',borderRadius:'14px',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>`
);
dp = dp.replace(
  `<p className="font-semibold text-[#323232]">No shifts today</p>`,
  `<p style={{color:'#F7F0E8',fontWeight:600}}>No shifts today</p>`
);
dp = dp.replace(
  `<p className="text-sm text-gray-400 mt-1 mb-4">Check your schedule for upcoming shifts</p>`,
  `<p style={{color:'rgba(247,240,232,0.4)',fontSize:'13px',margin:'6px 0 16px'}}>Check your schedule for upcoming shifts</p>`
);

fs.writeFileSync("src/app/(dashboard)/dashboard/page.tsx", dp, "utf8");
console.log("dashboard/page.tsx done");

console.log("\n✅ All done! Run: npm run build && git add . && git commit -m 'Complete dark theme across all pages' && git push");
