const fs = require("fs");

const BG = '#1a1a1a';
const CARD = '#242424';
const CARD2 = '#2e2e2e';
const BORDER = 'rgba(255,255,255,0.08)';
const CORAL = '#FF6357';
const CREAM = '#F7F0E8';
const MUTED = 'rgba(247,240,232,0.45)';

// ─── 1. GLOBAL BACKGROUND ────────────────────────────────────────────────────
let globals = fs.readFileSync("src/app/globals.css", "utf8");
globals = globals.replace(
  "background-color: #F7F0E8;",
  "background-color: #111111;"
);
fs.writeFileSync("src/app/globals.css", globals, "utf8");
console.log("globals.css updated");

// ─── 2. LAYOUT ───────────────────────────────────────────────────────────────
fs.writeFileSync("src/app/(dashboard)/layout.tsx", `import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!profile) redirect("/login")
  return (
    <div style={{minHeight:"100vh", backgroundColor:"#111111"}}>
      <Navbar profile={profile}/>
      <main style={{paddingTop:"64px"}}>
        <div style={{padding:"28px 32px 64px 32px"}}>{children}</div>
      </main>
    </div>
  )
}
`);
console.log("layout.tsx done");

// ─── 3. SCHEDULE VIEW ────────────────────────────────────────────────────────
let sv = fs.readFileSync("src/components/schedule/schedule-view.tsx", "utf8");

// Week nav
sv = sv.replace(
  `      <div className="bg-white rounded-3xl border border-black/[0.06] shadow-sm p-4 flex items-center justify-between">
        <button onClick={() => setCurrentWeek(w => subWeeks(w, 1))}
          className="w-10 h-10 rounded-2xl bg-[#F7F0E8] hover:bg-black/10 flex items-center justify-center transition-colors">
          <ChevronLeft size={18}/>
        </button>
        <div className="text-center">
          <p className="font-bold text-[#323232]">{format(currentWeek, 'MMM d')} â€" {format(addDays(currentWeek, 6), 'MMM d, yyyy')}</p>
          <p className="text-xs text-gray-400 mt-0.5">{weekSlots.length} shifts this week</p>
        </div>
        <button onClick={() => setCurrentWeek(w => addWeeks(w, 1))}
          className="w-10 h-10 rounded-2xl bg-[#F7F0E8] hover:bg-black/10 flex items-center justify-center transition-colors">
          <ChevronRight size={18}/>
        </button>
      </div>`,
  `      <div style={{backgroundColor:'#242424',borderRadius:'16px',border:'1px solid rgba(255,255,255,0.08)',padding:'14px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px'}}>
        <button onClick={() => setCurrentWeek(w => subWeeks(w, 1))}
          style={{width:'36px',height:'36px',borderRadius:'10px',backgroundColor:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.08)',color:'#F7F0E8',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <ChevronLeft size={16}/>
        </button>
        <div style={{textAlign:'center'}}>
          <p style={{color:'#F7F0E8',fontSize:'14px',fontWeight:700}}>{format(currentWeek, 'MMM d')} – {format(addDays(currentWeek, 6), 'MMM d, yyyy')}</p>
          <p style={{color:'rgba(247,240,232,0.45)',fontSize:'12px',marginTop:'2px'}}>{weekSlots.length} shifts this week</p>
        </div>
        <button onClick={() => setCurrentWeek(w => addWeeks(w, 1))}
          style={{width:'36px',height:'36px',borderRadius:'10px',backgroundColor:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.08)',color:'#F7F0E8',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <ChevronRight size={16}/>
        </button>
      </div>`
);

// Day cards
sv = sv.replace(
  `            <div key={dateStr} className="bg-white rounded-3xl shadow-sm border border-black/5"
              style={{outline: isToday ? '2px solid #FF6357' : '1px solid rgba(0,0,0,0.06)'}}>`,
  `            <div key={dateStr} style={{backgroundColor:'#242424',borderRadius:'16px',border: isToday ? '2px solid #FF6357' : '1px solid rgba(255,255,255,0.08)',boxShadow:'0 4px 24px rgba(0,0,0,0.3)',overflow:'hidden'}}>`
);

// Day header
sv = sv.replace(
  `              <div className="px-8 py-5 flex items-center justify-between"
                style={{backgroundColor: isToday ? '#FF6357' : '#323232'}}>`,
  `              <div style={{padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px',background: isToday ? '#FF6357' : 'linear-gradient(135deg,#2a2a2a,#1e1e1e)'}}>` 
);

sv = sv.replace(
  `                    <p className="font-black text-white text-2xl">{dayName}</p>
                    <p className="text-xs text-white/50">{format(date, 'MMMM d, yyyy')}</p>`,
  `                    <p style={{color:'#F7F0E8',fontSize:'20px',fontWeight:900,lineHeight:1,letterSpacing:'-0.02em'}}>{dayName}</p>
                    <p style={{color:'rgba(247,240,232,0.45)',fontSize:'11px',marginTop:'2px'}}>{format(date, 'MMMM d, yyyy')}</p>`
);

// Rush band
sv = sv.replace(
  `                  <div className="px-8 py-3 bg-white border-b border-black/5 flex items-center gap-4">`,
  `                  <div style={{padding:'8px 20px',backgroundColor:'#1e1e1e',borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'center',gap:'12px'}}>`
);

// Hour markers
sv = sv.replace(
  /className="absolute text-gray-400"/g,
  `style={{position:'absolute',color:'rgba(247,240,232,0.3)',fontSize:'8px',fontWeight:600,transform:'translateX(-50%)',whiteSpace:'nowrap'}}`
);

// Staff rows - dark theme
sv = sv.replace(
  `                    <div key={i} className="rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
                        style={{
                          backgroundColor: s.isMe ? 'rgba(255,99,87,0.06)' : \`\${s.color}10\`,
                          border: \`1px solid \${s.isMe ? 'rgba(255,99,87,0.2)' : s.color + '20'}\`,
                          outline: s.isMe ? '2px solid #FF6357' : 'none'
                        }}>`,
  `                    <div key={i} style={{borderRadius:'12px',padding:'12px 14px',border: s.isMe ? '1px solid rgba(255,99,87,0.4)' : '1px solid rgba(255,255,255,0.08)',backgroundColor: s.isMe ? 'rgba(255,99,87,0.1)' : 'rgba(255,255,255,0.04)',outline: s.isMe ? '2px solid #FF6357' : 'none'}}>`
);

sv = sv.replace(
  `                              <p className="text-base font-bold text-[#323232]">{s.full_name?.split(' ')[0]}</p>`,
  `                              <p style={{color:'#F7F0E8',fontSize:'14px',fontWeight:700}}>{s.full_name?.split(' ')[0]}</p>`
);

// Empty state
sv = sv.replace(
  `                <div className="px-6 py-10 text-center">
                  <Calendar size={28} className="text-gray-200 mx-auto mb-3"/>
                  <p className="text-sm text-gray-400 font-medium">No shifts scheduled</p>
                  <p className="text-xs text-gray-300 mt-1">Check back after the schedule is published</p>
                </div>`,
  `                <div style={{padding:'40px 24px',textAlign:'center'}}>
                  <Calendar size={28} style={{color:'rgba(247,240,232,0.2)',margin:'0 auto 12px'}}/>
                  <p style={{color:'rgba(247,240,232,0.45)',fontSize:'13px',fontWeight:500}}>No shifts scheduled</p>
                  <p style={{color:'rgba(247,240,232,0.25)',fontSize:'11px',marginTop:'4px'}}>Check back after the schedule is published</p>
                </div>`
);

fs.writeFileSync("src/components/schedule/schedule-view.tsx", sv, "utf8");
console.log("schedule-view.tsx done");

// ─── 4. AVAILABILITY GRID ────────────────────────────────────────────────────
let ag = fs.readFileSync("src/components/schedule/availability-grid.tsx", "utf8");
ag = ag.replace(/â˜€ï¸/g, "☀️").replace(/ðŸŒ¤ï¸/g, "🌤️").replace(/ðŸŒ™/g, "🌙");

// Week nav
ag = ag.replace(
  `        <div className="bg-white rounded-3xl border border-black/[0.06] shadow-sm p-4 flex items-center justify-between">`,
  `        <div style={{backgroundColor:'#242424',borderRadius:'16px',border:'1px solid rgba(255,255,255,0.08)',padding:'14px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px'}}>`
);
ag = ag.replace(
  `          className="w-10 h-10 rounded-2xl bg-[#F7F0E8] flex items-center justify-center hover:bg-black/10 transition-colors">
          <ChevronLeft size={18}/>
        </button>
        <div className="text-center">
          <p className="font-bold text-[#323232]">{format(monday,'MMM d')} — {format(addDays(monday,6),'MMM d, yyyy')}</p>
          <p className="text-xs text-gray-400 mt-0.5">{totalShifts} shifts selected this week</p>
        </div>
        <button onClick={() => { const d = new Date(weekStart+'T00:00:00'); d.setDate(d.getDate()+7); setWeekStart(format(d,'yyyy-MM-dd')); setSelections({}); setSubmitted(false) }}
          className="w-10 h-10 rounded-2xl bg-[#F7F0E8] flex items-center justify-center hover:bg-black/10 transition-colors">
          <ChevronRight size={18}/>`,
  `          style={{width:'36px',height:'36px',borderRadius:'10px',backgroundColor:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.08)',color:'#F7F0E8',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <ChevronLeft size={16}/>
        </button>
        <div style={{textAlign:'center'}}>
          <p style={{color:'#F7F0E8',fontSize:'14px',fontWeight:700}}>{format(monday,'MMM d')} — {format(addDays(monday,6),'MMM d, yyyy')}</p>
          <p style={{color:'rgba(247,240,232,0.45)',fontSize:'12px',marginTop:'2px'}}>{totalShifts} shifts selected this week</p>
        </div>
        <button onClick={() => { const d = new Date(weekStart+'T00:00:00'); d.setDate(d.getDate()+7); setWeekStart(format(d,'yyyy-MM-dd')); setSelections({}); setSubmitted(false) }}
          style={{width:'36px',height:'36px',borderRadius:'10px',backgroundColor:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.08)',color:'#F7F0E8',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <ChevronRight size={16}/>`
);

// Shift type counters
ag = ag.replace(
  `        <div key={shift.key} className={cn('rounded-2xl border p-3 text-center', shift.bg, shift.border)}>`,
  `        <div key={shift.key} style={{backgroundColor:'#242424',borderRadius:'12px',border:'1px solid rgba(255,255,255,0.08)',padding:'14px',textAlign:'center'}}>`
);

// Day cards
ag = ag.replace(
  `              className={cn('bg-white rounded-3xl border overflow-hidden shadow-sm',`,
  `              style={{backgroundColor:'#242424',borderRadius:'14px',border:`
);
ag = ag.replace(
  `                isWeekend ? 'border-orange-200' : 'border-black/[0.06]'`,
  `isWeekend ? '1px solid rgba(255,99,87,0.2)' : '1px solid rgba(255,255,255,0.08)',overflow:'hidden'`
);
ag = ag.replace(/\s*\)}\s*>(\s*\{\/\* Day header \*\/\})/, ">$1");

// Day header
ag = ag.replace(
  `                className={cn('px-5 py-3 flex items-center justify-between',
                  isWeekend ? 'bg-orange-50' : 'bg-[#F7F0E8]'
                )}>`,
  `                style={{padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',backgroundColor: isWeekend ? 'rgba(255,99,87,0.1)' : 'rgba(255,255,255,0.04)'}}>`
);
ag = ag.replace(
  `                  <p className="font-bold text-[#323232]">{FULL_DAYS[dayIndex]}</p>
                  <p className="text-xs text-gray-400">{format(date, 'MMM d')}</p>`,
  `                  <p style={{color:'#F7F0E8',fontSize:'14px',fontWeight:700}}>{FULL_DAYS[dayIndex]}</p>
                  <p style={{color:'rgba(247,240,232,0.45)',fontSize:'11px'}}>{format(date, 'MMM d')}</p>`
);

// Submit bar
ag = ag.replace(
  `      <div className="bg-white rounded-3xl border border-black/[0.06] shadow-sm p-5 flex items-center justify-between gap-4">
        <div>
          <p className="font-bold text-[#323232]">{totalShifts} shifts selected</p>
          <p className="text-xs text-gray-400 mt-0.5">AM: {shiftCounts.AM}/2 · MID: {shiftCounts.MID}/2 · PM: {shiftCounts.PM}/2</p>
          {savedMsg && <p className="text-xs text-green-600 font-semibold mt-1">{savedMsg}</p>}
        </div>`,
  `      <div style={{backgroundColor:'#242424',borderRadius:'16px',border:'1px solid rgba(255,255,255,0.08)',padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'16px'}}>
        <div>
          <p style={{color:'#F7F0E8',fontSize:'14px',fontWeight:700}}>{totalShifts} shifts selected</p>
          <p style={{color:'rgba(247,240,232,0.45)',fontSize:'12px',marginTop:'2px'}}>AM: {shiftCounts.AM}/2 · MID: {shiftCounts.MID}/2 · PM: {shiftCounts.PM}/2</p>
          {savedMsg && <p style={{color:'#22c55e',fontSize:'12px',fontWeight:600,marginTop:'4px'}}>{savedMsg}</p>}
        </div>`
);

fs.writeFileSync("src/components/schedule/availability-grid.tsx", ag, "utf8");
console.log("availability-grid.tsx done");

// ─── 5. SWAP MANAGER ─────────────────────────────────────────────────────────
let sm = fs.readFileSync("src/components/schedule/swap-manager.tsx", "utf8");
sm = sm.replace(
  /className="space-y-4"/g, `style={{display:'flex',flexDirection:'column',gap:'16px'}}`
);
sm = sm.replace(
  /<Card key={swap\.id} padding="sm">/g,
  `<div key={swap.id} style={{backgroundColor:'#242424',borderRadius:'14px',border:'1px solid rgba(255,255,255,0.08)',padding:'16px'}}>`
);
sm = sm.replace(/<\/Card>/g, `</div>`);
sm = sm.replace(/<Card>/g, `<div style={{backgroundColor:'#242424',borderRadius:'14px',border:'1px solid rgba(255,255,255,0.08)',padding:'20px'}}>`);
sm = sm.replace(
  `className="font-semibold text-[#323232] text-sm">`,
  `style={{color:'#F7F0E8',fontSize:'14px',fontWeight:600}}>`
);
sm = sm.replace(
  /className="text-xs text-gray-500 mt-0\.5">/g,
  `style={{color:'rgba(247,240,232,0.45)',fontSize:'12px',marginTop:'2px'}}>`
);
sm = sm.replace(
  `<Card><p className="text-center text-gray-400 text-sm py-8">No swap requests</p></Card>`,
  `<div style={{backgroundColor:'#242424',borderRadius:'14px',border:'1px solid rgba(255,255,255,0.08)',padding:'40px',textAlign:'center'}}><p style={{color:'rgba(247,240,232,0.45)',fontSize:'13px'}}>No swap requests</p></div>`
);
fs.writeFileSync("src/components/schedule/swap-manager.tsx", sm, "utf8");
console.log("swap-manager.tsx done");

// ─── 6. DAY OFF MANAGER ──────────────────────────────────────────────────────
let dom = fs.readFileSync("src/components/schedule/day-off-manager.tsx", "utf8");
dom = dom.replace(/<Card key={req\.id} padding="sm">/g, `<div key={req.id} style={{backgroundColor:'#242424',borderRadius:'14px',border:'1px solid rgba(255,255,255,0.08)',padding:'16px'}}>`);
dom = dom.replace(/<Card>/g, `<div style={{backgroundColor:'#242424',borderRadius:'14px',border:'1px solid rgba(255,255,255,0.08)',padding:'20px'}}>`);
dom = dom.replace(/<\/Card>/g, `</div>`);
dom = dom.replace(/className="font-semibold text-\[#323232\]"/g, `style={{color:'#F7F0E8',fontSize:'14px',fontWeight:600}}`);
dom = dom.replace(/className="text-sm text-gray-500 mt-0\.5"/g, `style={{color:'rgba(247,240,232,0.45)',fontSize:'12px',marginTop:'2px'}}`);
dom = dom.replace(/className="text-xs text-gray-400 mt-1"/g, `style={{color:'rgba(247,240,232,0.3)',fontSize:'11px',marginTop:'4px'}}`);
dom = dom.replace(
  `<Card>\n            <p className="text-center text-gray-400 text-sm py-8">No day off requests yet</p>\n          </Card>`,
  `<div style={{backgroundColor:'#242424',borderRadius:'14px',border:'1px solid rgba(255,255,255,0.08)',padding:'40px',textAlign:'center'}}><p style={{color:'rgba(247,240,232,0.45)',fontSize:'13px'}}>No day off requests yet</p></div>`
);
fs.writeFileSync("src/components/schedule/day-off-manager.tsx", dom, "utf8");
console.log("day-off-manager.tsx done");

// ─── 7. ATTENDANCE MANAGER ───────────────────────────────────────────────────
let am = fs.readFileSync("src/components/schedule/attendance-manager.tsx", "utf8");
am = am.replace(/<Card>/g, `<div style={{backgroundColor:'#242424',borderRadius:'14px',border:'1px solid rgba(255,255,255,0.08)',padding:'20px'}}>`);
am = am.replace(/<\/Card>/g, `</div>`);
am = am.replace(
  `className="flex items-center gap-3 p-4 rounded-xl bg-[#F7F0E8]"`,
  `style={{display:'flex',alignItems:'center',gap:'12px',padding:'14px',borderRadius:'12px',backgroundColor:'rgba(255,255,255,0.06)'}}`
);
am = am.replace(/className="text-sm font-medium text-\[#323232\]"/g, `style={{color:'#F7F0E8',fontSize:'13px',fontWeight:500}}`);
am = am.replace(/className="text-2xl font-bold text-\[#323232\]"/g, `style={{color:'#F7F0E8',fontSize:'24px',fontWeight:800}}`);
am = am.replace(/className="flex items-center justify-between p-3 rounded-xl bg-\[#F7F0E8\]"/g, `style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px',borderRadius:'10px',backgroundColor:'rgba(255,255,255,0.06)'}}`);
am = am.replace(/className="text-sm font-medium text-\[#323232\]">/g, `style={{color:'#F7F0E8',fontSize:'13px',fontWeight:500}}>`);
fs.writeFileSync("src/components/schedule/attendance-manager.tsx", am, "utf8");
console.log("attendance-manager.tsx done");

// ─── 8. PASSWORD CHANGE ──────────────────────────────────────────────────────
let pc = fs.readFileSync("src/components/settings/password-change.tsx", "utf8");
pc = pc.replace(/<Card>/g, `<div style={{backgroundColor:'#242424',borderRadius:'14px',border:'1px solid rgba(255,255,255,0.08)',padding:'20px'}}>`);
pc = pc.replace(/<\/Card>/g, `</div>`);
pc = pc.replace(`<CardHeader><CardTitle>Your Profile</CardTitle></CardHeader>`, `<p style={{color:'rgba(247,240,232,0.45)',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'14px'}}>Your Profile</p>`);
pc = pc.replace(`<CardHeader><CardTitle>Change Password</CardTitle></CardHeader>`, `<p style={{color:'rgba(247,240,232,0.45)',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'14px'}}>Change Password</p>`);
pc = pc.replace(`className="font-bold text-[#323232] text-lg"`, `style={{color:'#F7F0E8',fontSize:'16px',fontWeight:700}}`);
pc = pc.replace(`className="text-sm text-gray-400"`, `style={{color:'rgba(247,240,232,0.45)',fontSize:'12px'}}`);
pc = pc.replace(`className="text-xs text-[#FF6357] font-semibold mt-0.5 capitalize"`, `style={{color:'#FF6357',fontSize:'11px',fontWeight:600,marginTop:'2px',textTransform:'capitalize'}}`);
fs.writeFileSync("src/components/settings/password-change.tsx", pc, "utf8");
console.log("password-change.tsx done");

// ─── 9. INPUT - dark theme ────────────────────────────────────────────────────
fs.writeFileSync("src/components/ui/input.tsx", `import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string; error?: string; hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, style, ...props }, ref) => (
    <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
      {label && <label style={{color:'rgba(247,240,232,0.5)',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em'}}>{label}</label>}
      <input ref={ref}
        style={{width:'100%',padding:'10px 14px',borderRadius:'10px',border: error ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',backgroundColor:'#2e2e2e',color:'#F7F0E8',fontSize:'14px',outline:'none',...style}}
        {...props}/>
      {error && <p style={{color:'#ef4444',fontSize:'12px',fontWeight:500}}>{error}</p>}
      {hint && !error && <p style={{color:'rgba(247,240,232,0.3)',fontSize:'12px'}}>{hint}</p>}
    </div>
  )
)
Input.displayName = 'Input'
`);
console.log("input.tsx done");

// ─── 10. PAGE HEADERS - dark ─────────────────────────────────────────────────
const pages = [
  ["src/app/(dashboard)/schedule/page.tsx", "Schedule", isAdmin => isAdmin ? 'Full team schedule' : 'Your upcoming shifts'],
  ["src/app/(dashboard)/availability/page.tsx", "My Availability", "Pick your shifts. Max 2 of each type. Fri/Sat/Sun mandatory."],
  ["src/app/(dashboard)/swaps/page.tsx", "Shift Swaps", "Request and manage shift swaps"],
  ["src/app/(dashboard)/days-off/page.tsx", "Days Off", "Request and track your days off"],
  ["src/app/(dashboard)/attendance/page.tsx", "Attendance", "Check in and out of your shifts"],
  ["src/app/(dashboard)/settings/page.tsx", "Settings", "Manage your account"],
];

pages.forEach(([file, title, subtitle]) => {
  try {
    let content = fs.readFileSync(file, "utf8");
    content = content
      .replace(`<h1 className="text-2xl font-bold text-[#323232] tracking-tight">${title}</h1>`, `<h1 style={{color:'#F7F0E8',fontSize:'22px',fontWeight:800,marginBottom:'4px'}}>${title}</h1>`)
      .replace(`<h1 className="text-2xl font-bold text-[#323232]">${title}</h1>`, `<h1 style={{color:'#F7F0E8',fontSize:'22px',fontWeight:800,marginBottom:'4px'}}>${title}</h1>`)
      .replace(/className="text-gray-500 text-sm mt-1">/g, `style={{color:'rgba(247,240,232,0.45)',fontSize:'13px',marginBottom:'20px'}}>`);
    fs.writeFileSync(file, content, "utf8");
  } catch(e) { console.log("skip:", file); }
});
console.log("page headers done");

console.log("\n✅ All done! Run: npm run build && git add . && git commit -m 'Dark premium theme all pages' && git push");
