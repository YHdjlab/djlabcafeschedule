const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Fix corrupted bullet character
ap = ap.replace(/Â·/g, "-");

// Refine the slot card styling - make role badges colored and layout cleaner
ap = ap.replace(
  `<div key={a.field} className="flex items-center gap-2 p-2 rounded-xl bg-[#F7F0E8]">
                                <div className="w-6 h-6 rounded-full bg-[#323232] flex items-center justify-center flex-shrink-0">
                                  <span className="text-white text-xs font-bold">{current?.full_name?.charAt(0)}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-[#323232] truncate">{current?.full_name?.split(' ')[0] || 'Unassigned'}</p>
                                  <p className="text-xs text-gray-400">{a.role}</p>
                                </div>`,
  `<div key={a.field} className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F7F0E8] border border-black/5">
                                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold", a.role === 'Supervisor' ? "bg-blue-500" : a.role === 'Bar' ? "bg-purple-500" : "bg-green-500")}>
                                  {current?.full_name?.charAt(0) || '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-[#323232] truncate">{current?.full_name?.split(' ')[0] || 'Unassigned'}</p>
                                  <p className={cn("text-xs font-medium", a.role === 'Supervisor' ? "text-blue-500" : a.role === 'Bar' ? "text-purple-500" : "text-green-600")}>{a.role}</p>
                                </div>`
);

// Improve the swap dropdown
ap = ap.replace(
  `className="text-xs border border-black/10 rounded-lg px-1 py-0.5 bg-white text-[#323232] cursor-pointer"`,
  `className="text-xs border border-[#FF6357]/30 rounded-lg px-1.5 py-1 bg-white text-[#FF6357] cursor-pointer font-medium hover:border-[#FF6357]"`
);

// Improve slot header - bolder time display
ap = ap.replace(
  `<span className="text-xs text-gray-400">{ft(slot.start)} - {ft(slot.end === '00:00' ? '00:00' : slot.end)}</span>`,
  `<span className="text-xs font-semibold text-[#323232] bg-[#F7F0E8] px-2 py-1 rounded-lg">{ft(slot.start)} - {ft(slot.end)}</span>`
);

// Fix the slot label styling
ap = ap.replace(
  `<span className="text-xs font-semibold text-[#323232]">{slot.label}</span>`,
  `<span className="text-sm font-semibold text-[#323232]">{slot.label}</span>`
);

// Add margin between slots
ap = ap.replace(
  `<div key={slot.key} className="px-4 py-3">`,
  `<div key={slot.key} className="px-4 py-4">`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("Done");
