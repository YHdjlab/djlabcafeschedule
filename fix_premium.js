const fs = require("fs");

let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// 1. Fix corrupted bullet
ap = ap.replace(/Â·/g, "·");

// 2. Premium day card header
ap = ap.replace(
  `<div key={slot.key} className={cn('bg-white rounded-2xl shadow-sm w-full', slot.issues?.length ? 'border-2 border-red-200' : 'border border-black/5')}>`,
  `<div key={slot.key} className={cn('bg-white rounded-3xl shadow-sm w-full overflow-hidden', slot.issues?.length ? 'ring-2 ring-red-300' : 'ring-1 ring-black/[0.06]')}>`
);

ap = ap.replace(
  `<div className={cn('px-6 py-5 flex items-center justify-between gap-4', slot.issues?.length ? 'bg-red-900' : 'bg-[#323232]')}>
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-black text-white text-xl">{slot.day}</p>
                      <p className="text-xs text-white/50">{slot.date}</p>
                    </div>
                    {isWeekend && <span className="text-xs px-2.5 py-1 rounded-full bg-[#FF6357] text-white font-semibold">Full Rush</span>}
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-white whitespace-nowrap">{fmtH(slot.startH)} - {fmtH(slot.endH)}</p>
                    <p className="text-xs text-white/50">{slot.staff?.length || 0} staff · {slot.issues?.length ? slot.issues.length + ' issue' + (slot.issues.length > 1 ? 's' : '') : 'all good'}</p>
                  </div>
                </div>`,
  `<div className={cn('px-6 py-4 flex items-center justify-between gap-4', slot.issues?.length ? 'bg-red-900' : 'bg-[#323232]')}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="min-w-0">
                      <p className="font-black text-white text-lg leading-tight">{slot.day}</p>
                      <p className="text-xs text-white/40 mt-0.5">{slot.date}</p>
                    </div>
                    {isWeekend && <span className="text-xs px-2.5 py-1 rounded-full bg-[#FF6357]/90 text-white font-semibold flex-shrink-0">Rush</span>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base font-black text-white">{fmtH(slot.startH)} – {fmtH(slot.endH)}</p>
                    <p className="text-xs text-white/40 mt-0.5">{slot.staff?.filter((m:any)=>m.role!=='Available').length || 0} assigned · {slot.issues?.length ? slot.issues.length + ' issue' + (slot.issues.length>1?'s':'') : 'all good'}</p>
                  </div>
                </div>`
);

// 3. Premium rush band
ap = ap.replace(
  `<div className="px-6 py-3 bg-[#F7F0E8] border-b border-black/5 flex items-center gap-4 flex-wrap">`,
  `<div className="px-6 py-2.5 bg-[#F7F0E8]/80 border-b border-black/[0.06] flex items-center gap-4">`
);

// 4. Premium staff cards
ap = ap.replace(
  `const roleBg = member.role === 'Supervisor' ? 'bg-blue-50 border-blue-100' : member.role === 'Bar' ? 'bg-purple-50 border-purple-100' : member.role === 'Available' ? 'bg-gray-50 border-dashed border-gray-300' : 'bg-green-50 border-green-100'`,
  `const roleBg = member.role === 'Supervisor' ? 'bg-blue-50/80 border-blue-100/80' : member.role === 'Bar' ? 'bg-purple-50/80 border-purple-100/80' : member.role === 'Available' ? 'bg-gray-50 border-dashed border-gray-200' : 'bg-emerald-50/80 border-emerald-100/80'`
);
ap = ap.replace(
  `const roleColor = member.role === 'Supervisor' ? 'bg-blue-500' : member.role === 'Bar' ? 'bg-purple-500' : member.role === 'Available' ? 'bg-gray-400' : 'bg-green-500'`,
  `const roleColor = member.role === 'Supervisor' ? 'bg-blue-500' : member.role === 'Bar' ? 'bg-violet-500' : member.role === 'Available' ? 'bg-gray-300' : 'bg-emerald-500'`
);

// 5. Premium card container
ap = ap.replace(
  `<div key={member.id} className={cn("rounded-2xl border px-4 py-3", roleBg, member.role === 'Available' && 'opacity-70')}>`,
  `<div key={member.id} className={cn("rounded-2xl border px-4 py-3 transition-all", roleBg, member.role === 'Available' && 'opacity-60')}>`
);

// 6. Premium Swap select
ap = ap.replace(
  /className={cn\("text-xs rounded-xl px-3 py-1\.5 border-2 cursor-pointer font-bold bg-white flex-shrink-0 whitespace-nowrap", roleTextColor, "border-current\/40 hover:border-current\/70 transition-colors"\)}/g,
  `className={cn("text-xs rounded-xl px-3 py-1.5 border cursor-pointer font-semibold bg-white flex-shrink-0 whitespace-nowrap shadow-sm", roleTextColor, "border-current/30 hover:shadow-md transition-all")}`
);

// 7. Premium X button
ap = ap.replace(
  `className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center flex-shrink-0 transition-colors text-gray-400 text-xs font-bold border border-gray-200">✕</button>`,
  `className="w-6 h-6 rounded-full bg-black/5 hover:bg-red-50 hover:text-red-400 flex items-center justify-center flex-shrink-0 transition-all text-gray-300 text-xs font-bold">✕</button>`
);

// 8. Premium + Assign select
ap = ap.replace(
  `className="text-xs rounded-xl px-2 py-1 border-2 cursor-pointer font-bold bg-white text-[#FF6357] border-[#FF6357]/30 flex-shrink-0">`,
  `className="text-xs rounded-xl px-3 py-1.5 border cursor-pointer font-semibold bg-white text-[#FF6357] border-[#FF6357]/30 flex-shrink-0 shadow-sm hover:shadow-md transition-all">`
);

// 9. Premium Save and Submit
ap = ap.replace(
  `className="flex-shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#FF6357] text-white text-sm font-bold hover:bg-[#e5554a] transition-all disabled:opacity-50 shadow-sm whitespace-nowrap"`,
  `className="flex-shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#FF6357] text-white text-sm font-bold hover:bg-[#e5554a] active:scale-[0.98] transition-all disabled:opacity-50 shadow-md hover:shadow-lg whitespace-nowrap"`
);

// 10. Premium Schedule Preview header
ap = ap.replace(
  `<div className="bg-white rounded-2xl border border-black/5 p-4 flex items-center justify-between gap-4">`,
  `<div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-4 flex items-center justify-between gap-4">`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("admin-panel premium done");
