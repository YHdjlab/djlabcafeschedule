const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Fix 1: corrupted bullet character
ap = ap.replace(/Â·/g, "·");

// Fix 2: staff grid - switch from grid-cols-2 to single column list for breathing room
ap = ap.replace(
  '<div className="p-5 grid grid-cols-2 gap-4">',
  '<div className="px-6 py-4 space-y-3">'
);

// Fix 3: staff card - make it horizontal row instead of cramped card
ap = ap.replace(
  `                      <div key={member.id} className={cn("rounded-2xl border p-4 flex flex-col gap-3", roleBg)}>
                        <div className="flex items-center justify-between">
                          <span className={cn("text-xs font-bold uppercase tracking-wide", roleTextColor)}>{member.role}</span>
                          {alts.length > 0 && (
                            <select value="" onChange={e => {
                              if (!e.target.value) return
                              const newId = e.target.value
                              setGeneratedSlots((prev: any[]) => prev.map((gs: any) => {
                                if (gs.key !== slot.key) return gs
                                const updated = { ...gs, [fieldName]: newId }
                                const newStaff = gs.staff.map((m: any) => m.id === member.id ? { ...m, id: newId, info: null } : m)
                                return { ...updated, staff: newStaff }
                              }))
                            }}
                              className={cn("text-xs rounded-lg px-2 py-0.5 border cursor-pointer font-semibold bg-white", roleTextColor, "border-current/20")}>
                              <option value="">Swap</option>
                              {alts.map((sid: string) => (
                                <option key={sid} value={sid}>{STAFF_MAP[sid]?.full_name?.split(' ')[0]}</option>
                              ))}
                            </select>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0", roleColor)}>
                            {s.full_name?.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[#323232] truncate">{s.full_name?.split(' ')[0]}</p>
                            {info ? (
                              <p className="text-xs text-gray-500">{fmtH(info.startH)}-{fmtH(info.endH)} <span className="font-semibold text-[#FF6357]">{info.totalH}h</span></p>
                            ) : (
                              <p className="text-xs text-gray-400">-</p>
                            )}
                          </div>
                        </div>
                      </div>`,
  `                      <div key={member.id} className={cn("rounded-2xl border px-5 py-4 flex items-center justify-between gap-4", roleBg)}>
                        <div className="flex items-center gap-4">
                          <div className={cn("w-11 h-11 rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0", roleColor)}>
                            {s.full_name?.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-base font-bold text-[#323232]">{s.full_name?.split(' ')[0]}</p>
                              <span className={cn("text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full", roleBg, roleTextColor, "border")}>{member.role}</span>
                            </div>
                            {info ? (
                              <p className="text-sm text-gray-500 mt-0.5">{fmtH(info.startH)} - {fmtH(info.endH)} <span className="font-bold text-[#FF6357] ml-1">{info.totalH}h</span></p>
                            ) : (
                              <p className="text-sm text-gray-400 mt-0.5">Hours unknown</p>
                            )}
                          </div>
                        </div>
                        {alts.length > 0 && (
                          <select value="" onChange={e => {
                            if (!e.target.value) return
                            const newId = e.target.value
                            setGeneratedSlots((prev: any[]) => prev.map((gs: any) => {
                              if (gs.key !== slot.key) return gs
                              const updated = { ...gs, [fieldName]: newId }
                              const newStaff = gs.staff.map((m: any) => m.id === member.id ? { ...m, id: newId, info: null } : m)
                              return { ...updated, staff: newStaff }
                            }))
                          }}
                            className={cn("text-sm rounded-xl px-3 py-1.5 border-2 cursor-pointer font-bold bg-white flex-shrink-0", roleTextColor, "border-current/30 hover:border-current/60 transition-colors")}>
                            <option value="">Swap</option>
                            {alts.map((sid: string) => (
                              <option key={sid} value={sid}>{STAFF_MAP[sid]?.full_name?.split(' ')[0]}</option>
                            ))}
                          </select>
                        )}
                      </div>`
);

// Fix 4: issues section more padding
ap = ap.replace(
  '<div className="mx-5 mb-5 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-2">',
  '<div className="mx-6 mb-6 px-5 py-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">'
);

// Fix 5: day header more breathing room
ap = ap.replace(
  "<div className={cn('px-6 py-5 flex items-center justify-between', slot.issues?.length ? 'bg-red-800' : 'bg-[#323232]')}>",
  "<div className={cn('px-8 py-6 flex items-center justify-between', slot.issues?.length ? 'bg-red-900' : 'bg-[#323232]')}>"
);

// Fix 6: rush band more padding
ap = ap.replace(
  '<div className="px-6 py-3 bg-white border-b border-black/5 flex items-center gap-4">',
  '<div className="px-8 py-4 bg-[#F7F0E8] border-b border-black/5 flex items-center gap-6">'
);

// Fix 7: space-y-5 to space-y-8 between day cards
ap = ap.replace(
  '<div className="space-y-5">',
  '<div className="space-y-8">'
);

// Fix 8: day name bigger
ap = ap.replace(
  '<p className="font-bold text-white text-lg">{slot.day}</p>',
  '<p className="font-black text-white text-2xl">{slot.day}</p>'
);

// Fix 9: time display bigger
ap = ap.replace(
  '<p className="text-base font-bold text-white">{fmtH(slot.startH)} - {fmtH(slot.endH)}</p>',
  '<p className="text-xl font-black text-white">{fmtH(slot.startH)} - {fmtH(slot.endH)}</p>'
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("Done");
