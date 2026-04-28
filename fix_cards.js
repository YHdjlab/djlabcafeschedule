const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// The day header has px-6 py-4 - reduce it and ensure no overflow
ap = ap.replace(
  `<div className={cn('px-6 py-4 flex items-center justify-between gap-4', slot.issues?.length ? 'bg-red-900' : 'bg-[#323232]')}>`,
  `<div className={cn('px-4 py-4 flex items-center justify-between gap-2', slot.issues?.length ? 'bg-red-900' : 'bg-[#323232]')} style={{minWidth:0}}>`
);

// The outer card - add overflow hidden
ap = ap.replace(
  `<div key={slot.key} className={cn('bg-white rounded-3xl shadow-sm w-full', slot.issues?.length ? 'ring-2 ring-red-300' : 'ring-1 ring-black/[0.06]')}>`,
  `<div key={slot.key} style={{overflow:'hidden', borderRadius:'1.5rem', boxShadow:'0 1px 3px rgba(0,0,0,0.08)', border: slot.issues?.length ? '2px solid #fca5a5' : '1px solid rgba(0,0,0,0.06)', width:'100%'}}>`
);

// Staff card padding
ap = ap.replace(
  `<div key={member.id} className={cn("rounded-2xl border px-4 py-3 transition-all", roleBg, member.role === 'Available' && 'opacity-60')}>`,
  `<div key={member.id} className={cn("rounded-2xl border px-3 py-3 transition-all", roleBg, member.role === 'Available' && 'opacity-60')} style={{minWidth:0}}>`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
